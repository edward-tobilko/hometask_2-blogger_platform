import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';

import { configModule } from 'src/config/dynamic-config.module';
import { CoreModule } from 'src/core/core.module';
import { QuestionOrmEntity } from 'src/modules/quiz-game/questions/infrastructure/schemas/question-orm.entity';
import { QuizGameModule } from 'src/modules/quiz-game/quiz-game.module';
import { CreateQuestionCommand } from 'src/modules/quiz-game/questions/application/use-cases/create-question.use-case';
import { UpdateQuestionCommand } from 'src/modules/quiz-game/questions/application/use-cases/update-question.use-case';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

describe('Quiz questions — update (integration)', () => {
  let moduleRef: TestingModule;
  let commandBus: CommandBus;
  let questionsRepo: Repository<QuestionOrmEntity>;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [configModule, CoreModule, QuizGameModule],
    }).compile();

    await moduleRef.init();

    commandBus = moduleRef.get(CommandBus);
    questionsRepo = moduleRef.get(DataSource).getRepository(QuestionOrmEntity);
  });

  beforeEach(async () => {
    await questionsRepo.query(
      'TRUNCATE TABLE quiz_questions RESTART IDENTITY CASCADE',
    );
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  const createQuestion = async (
    body = 'Original question body',
    correctAnswers = ['original'],
  ): Promise<string> => {
    const { id } = await commandBus.execute(
      new CreateQuestionCommand({ body, correctAnswers }),
    );

    return id;
  };

  const updateQuestion = (id: string, body: string, correctAnswers: string[]) =>
    commandBus.execute(new UpdateQuestionCommand(id, { body, correctAnswers }));

  it('overwrites "body" and correct answers', async () => {
    const id = await createQuestion();

    await updateQuestion(id, 'Updated question body', ['new', 'новый']);

    const entity = await questionsRepo.findOneByOrFail({ id });

    expect(entity.body).toBe('Updated question body');
    expect(entity.correctAnswers).toEqual(['new', 'новый']);
  });

  it('sets updatedAt on update and keeps createdAt', async () => {
    const id = await createQuestion();
    const before = await questionsRepo.findOneByOrFail({ id });

    expect(before.updatedAt).toBeNull();

    await updateQuestion(id, 'Updated question body', ['new']);

    const after = await questionsRepo.findOneByOrFail({ id });

    expect(after.updatedAt).toBeInstanceOf(Date);
    expect(after.createdAt.getTime()).toBe(before.createdAt.getTime());
  });

  it('does not change "published" flag', async () => {
    const id = await createQuestion();

    await questionsRepo.update({ id }, { published: true });

    await updateQuestion(id, 'Updated question body', ['new']);

    const entity = await questionsRepo.findOneByOrFail({ id });

    expect(entity.published).toBe(true);
  });

  it('updates only the requested question', async () => {
    const updatedId = await createQuestion('Question that will change');
    const keptId = await createQuestion('Question that must stay', ['kept']);

    await updateQuestion(updatedId, 'Updated question body', ['new']);

    const kept = await questionsRepo.findOneByOrFail({ id: keptId });

    expect(kept.body).toBe('Question that must stay');
    expect(kept.correctAnswers).toEqual(['kept']);
  });

  it('throws NotFound (404) for unknown question id', async () => {
    const result = updateQuestion(
      '00000000-0000-0000-0000-000000000000',
      'Updated question body',
      ['new'],
    );

    await expect(result).rejects.toMatchObject({
      code: DomainExceptionCode.NotFound,
    });
  });

  it('rejects removing all correct answers from a published question', async () => {
    const id = await createQuestion('Published question body', ['7']);

    await questionsRepo.update({ id }, { published: true });

    await expect(
      updateQuestion(id, 'Published question body', []),
    ).rejects.toMatchObject({ code: DomainExceptionCode.BadRequest });

    const entity = await questionsRepo.findOneByOrFail({ id });

    expect(entity.correctAnswers).toEqual(['7']);
  });

  it('allows empty correct answers for an unpublished question', async () => {
    const id = await createQuestion('Draft question body', ['7']);

    await updateQuestion(id, 'Draft question body', []);

    const entity = await questionsRepo.findOneByOrFail({ id });

    expect(entity.correctAnswers).toEqual([]);
  });
});
