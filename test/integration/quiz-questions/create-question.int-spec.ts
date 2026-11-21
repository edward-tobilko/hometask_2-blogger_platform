import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';

import { configModule } from 'src/config/dynamic-config.module';
import { CoreModule } from 'src/core/core.module';
import { QuestionOrmEntity } from 'src/modules/quiz-game/questions/infrastructure/schemas/question-orm.entity';
import { QuizGameModule } from 'src/modules/quiz-game/quiz-game.module';
import { CreateQuestionCommand } from 'src/modules/quiz-game/questions/application/use-cases/create-question.use-case';
import { GetQuestionByIdQuery } from 'src/modules/quiz-game/questions/application/queries/get-question-by-id.query';
import { QuestionViewModel } from 'src/modules/quiz-game/questions/api/view-dto/question.view-dto';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

describe('Quiz questions — create (integration)', () => {
  let module: TestingModule;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let questionsRepo: Repository<QuestionOrmEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, CoreModule, QuizGameModule], // только то, что нужно квизу — без HTTP;
    }).compile();

    await module.init(); // CQRS регистрирует handler-ы на bootstrap-хуке — без init() шина bus их не найдёт;

    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
    questionsRepo = module.get(DataSource).getRepository(QuestionOrmEntity);
  });

  beforeEach(async () => {
    await questionsRepo.query(
      'TRUNCATE TABLE quiz_questions RESTART IDENTITY CASCADE', // очищаем таблицы с сохранением структуры;
    );
  });

  afterAll(async () => {
    await module.close(); // закрывает пул соединений, иначе jest не завершится;
  });

  const createQuestion = (body: string, correctAnswers: string[]) =>
    commandBus.execute(new CreateQuestionCommand({ body, correctAnswers }));

  it('persists question as unpublished with given body and answers', async () => {
    const { id } = await createQuestion('How many continents are there?', [
      '7',
      'seven',
    ]);

    const entity = await questionsRepo.findOneByOrFail({ id });

    expect(entity.body).toBe('How many continents are there?');
    expect(entity.correctAnswers).toEqual(['7', 'seven']);
    expect(entity.published).toBe(false);
    expect(entity.createdAt).toBeInstanceOf(Date);
  });

  it('stores correct answers as a real json array, not a string', async () => {
    const { id } = await createQuestion(
      'How many queues does event loop have?',
      ['3', 'три'],
    );

    const [raw] = await questionsRepo.query<{ type: string }[]>(
      `SELECT jsonb_typeof(correct_answers) AS type FROM quiz_questions WHERE id = $1`,
      [id],
    );

    expect(raw.type).toBe('array');
  });

  it('returns id of the row that was actually saved', async () => {
    const { id } = await createQuestion('What is the capital of France?', [
      'Paris',
    ]);

    expect(await questionsRepo.count()).toBe(1);
    expect(await questionsRepo.existsBy({ id })).toBe(true);
  });

  it('maps created question to view model with iso dates', async () => {
    const { id } = await createQuestion('How many bits are in one byte?', [
      '8',
    ]);

    const view = await queryBus.execute<
      GetQuestionByIdQuery,
      QuestionViewModel
    >(new GetQuestionByIdQuery(id));

    expect(view).toEqual({
      id,
      body: 'How many bits are in one byte?',
      correctAnswers: ['8'],
      published: false,
      createdAt: expect.stringMatching(/Z$/),
      updatedAt: null,
    });
  });

  it('throws 404 (NotFound) domain exception for unknown question id', async () => {
    const query = queryBus.execute(
      new GetQuestionByIdQuery('00000000-0000-0000-0000-000000000000'),
    );

    await expect(query).rejects.toMatchObject({
      code: DomainExceptionCode.NotFound,
    });
  });
});
