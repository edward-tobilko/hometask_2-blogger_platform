import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { configModule } from 'src/config/dynamic-config.module';
import { CoreModule } from 'src/core/core.module';
import { QuizGameModule } from 'src/modules/quiz-game/quiz-game.module';
import { GetAllQuestionsQuery } from 'src/modules/quiz-game/questions/application/queries/get-all-questions-query';
import { QuestionsListPaginatedViewModel } from 'src/modules/quiz-game/questions/api/view-dto/questions-paginated.view-dto';
import { QuestionsListQueryInputDto } from 'src/modules/quiz-game/questions/api/input-dto/questions-list-query.input-dto';

describe('Quiz questions — get all questions (integration)', () => {
  let moduleRef: TestingModule;
  let queryBus: QueryBus;
  let dataSource: DataSource;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [configModule, CoreModule, QuizGameModule],
    }).compile();

    await moduleRef.init();

    queryBus = moduleRef.get(QueryBus);
    dataSource = moduleRef.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE quiz_questions RESTART IDENTITY CASCADE',
    );
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  // * Вставляем SQL-ом напрямую: через use-case не задать created_at и published, а тестам нужен контроль над ними.
  const createSeedQuestion = async (
    body: string,
    options: { published?: boolean; createdAt?: Date } = {},
  ): Promise<string> => {
    const [row] = await dataSource.query<{ id: string }[]>(
      `INSERT INTO quiz_questions (body, correct_answers, published, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $4)
         RETURNING id`,
      [
        body,
        JSON.stringify(['answer']),
        options.published ?? false,
        options.createdAt ?? new Date(),
      ],
    );

    return row.id;
  };

  // * plainToInstance класс от class-transformer повторяет то, что делает ValidationPipe с query-строкой: defaults из класса + методы calculateSkip / Sort.
  const getAll = (params: Record<string, unknown> = {}) =>
    queryBus.execute<GetAllQuestionsQuery, QuestionsListPaginatedViewModel>(
      new GetAllQuestionsQuery(
        plainToInstance(QuestionsListQueryInputDto, params),
      ),
    );

  it('returns first page sorted by createdAt desc by default', async () => {
    const base = Date.now();

    const oldestId = await createSeedQuestion('Oldest question body', {
      createdAt: new Date(base - 2000),
    });

    const middleId = await createSeedQuestion('Middle question body', {
      createdAt: new Date(base - 1000),
    });

    const newestId = await createSeedQuestion('Newest question body', {
      createdAt: new Date(base),
    });

    const result = await getAll();

    expect(result).toMatchObject({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 3,
    });

    expect(result.items.map((question) => question.id)).toEqual([
      newestId,
      middleId,
      oldestId,
    ]);
  });

  it('applies pageNumber and pageSize and calculates pagesCount', async () => {
    for (let i = 0; i < 12; i++) {
      await createSeedQuestion(`Question number ${i}`, {
        createdAt: new Date(Date.now() - i * 1000),
      });
    }

    const result = await getAll({ pageNumber: 3, pageSize: 5 });

    expect(result).toMatchObject({
      pagesCount: 3,
      page: 3,
      pageSize: 5,
      totalCount: 12,
    });

    expect(result.items.map((question) => question.body)).toEqual([
      'Question number 10',
      'Question number 11',
    ]);
  });

  it.each([
    ['published', ['Published question']],
    ['notPublished', ['Draft question']],
    ['all', ['Published question', 'Draft question']],
  ])(
    'filters by publishedStatus=%s and counts only matching rows',
    async (publishedStatus, expectedBodies) => {
      await createSeedQuestion('Draft question', {
        published: false,
        createdAt: new Date(Date.now() - 1000),
      });

      await createSeedQuestion('Published question', {
        published: true,
        createdAt: new Date(Date.now()),
      });

      const result = await getAll({ publishedStatus });

      expect(result.totalCount).toBe(expectedBodies.length);
      expect(result.items.map((question) => question.body)).toEqual(
        expectedBodies,
      );
    },
  );

  it('finds questions by case-insensitive substring of body', async () => {
    await createSeedQuestion('How many queues does Event Loop have?');
    await createSeedQuestion('What is the capital of France?');

    const result = await getAll({ bodySearchTerm: 'event loop' });

    expect(result.totalCount).toBe(1);
    expect(result.items[0].body).toBe('How many queues does Event Loop have?');
  });

  it('treats % in search term literally, not as a wildcard', async () => {
    await createSeedQuestion('Is 100% of the moon visible?');
    await createSeedQuestion('Is 1000 bigger than 100?');

    const result = await getAll({ bodySearchTerm: '100%' });

    expect(result.items.map((question) => question.body)).toEqual([
      'Is 100% of the moon visible?',
    ]);
  });

  it('sorts by body "ASC" when requested', async () => {
    await createSeedQuestion('C question body');
    await createSeedQuestion('A question body');
    await createSeedQuestion('B question body');

    const result = await getAll({ sortBy: 'body', sortDirection: 'asc' });

    expect(result.items.map((question) => question.body)).toEqual([
      'A question body',
      'B question body',
      'C question body',
    ]);
  });

  it('keeps deterministic order across pages when sorted values are equal', async () => {
    const createdAt = new Date();
    const ids: string[] = [];

    for (let i = 0; i < 6; i++) {
      ids.push(await createSeedQuestion('Same question body', { createdAt }));
    }

    const page1 = await getAll({
      sortBy: 'body',
      sortDirection: 'asc',
      pageSize: 3,
      pageNumber: 1,
    });

    const page2 = await getAll({
      sortBy: 'body',
      sortDirection: 'asc',
      pageSize: 3,
      pageNumber: 2,
    });

    const seen = [...page1.items, ...page2.items].map(
      (question) => question.id,
    );

    expect(new Set(seen).size).toBe(6); // ни одного дубля / пропуска на стыке страниц;
    expect(seen).toEqual([...ids].sort()); // одинаковые body упорядочены по id;
  });
});
