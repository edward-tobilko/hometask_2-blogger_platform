import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';

import { configModule } from 'src/config/dynamic-config.module';
import { CoreModule } from 'src/core/core.module';
import { QuizGameModule } from 'src/modules/quiz-game/quiz-game.module';
import { QuestionOrmEntity } from 'src/modules/quiz-game/questions/infrastructure/schemas/question-orm.entity';
import { CreateQuestionCommand } from 'src/modules/quiz-game/questions/application/use-cases/create-question.use-case';
import { PublishQuestionCommand } from 'src/modules/quiz-game/questions/application/use-cases/publish-question.use-case';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

describe('Quiz questions — publish (integration)', () => {
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
    body = 'Question to publish',
    correctAnswers = ['answer'],
  ): Promise<string> => {
    const { id } = await commandBus.execute(
      new CreateQuestionCommand({ body, correctAnswers }),
    );

    return id;
  };

  const publishQuestion = (id: string, published: boolean) =>
    commandBus.execute(new PublishQuestionCommand(id, { published }));

  it('publishes a new (unpublished) question', async () => {
    const id = await createQuestion();

    await publishQuestion(id, true);

    const entity = await questionsRepo.findOneByOrFail({ id });

    expect(entity.published).toBe(true);
  });

  it('unpublishes a published question', async () => {
    const id = await createQuestion();

    await publishQuestion(id, true);

    await publishQuestion(id, false);

    const entity = await questionsRepo.findOneByOrFail({ id });

    expect(entity.published).toBe(false);
  });

  it('changes only published flag, body and answers stay the same', async () => {
    const id = await createQuestion('Question body must stay', [
      'kept',
      'тоже',
    ]);

    await publishQuestion(id, true);

    const entity = await questionsRepo.findOneByOrFail({ id });

    expect(entity.body).toBe('Question body must stay');
    expect(entity.correctAnswers).toEqual(['kept', 'тоже']);
  });

  it('moves "updatedAt" forward when status changes', async () => {
    const id = await createQuestion();

    // * Отодвигаем дату в прошлое, чтобы сравнение не зависело от миллисекунд.
    await questionsRepo.query(
      `UPDATE quiz_questions SET updated_at = now() - interval '1 hour' WHERE id = $1`,
      [id],
    );
    const before = await questionsRepo.findOneByOrFail({ id });

    await publishQuestion(id, true);

    const after = await questionsRepo.findOneByOrFail({ id });

    expect(after.updatedAt!.getTime()).toBeGreaterThan(
      before.updatedAt!.getTime(),
    );
  });

  it('publishes only the requested question', async () => {
    const publishedId = await createQuestion('Question that will be published');
    const draftId = await createQuestion('Question that stays draft');

    await publishQuestion(publishedId, true);

    const draft = await questionsRepo.findOneByOrFail({ id: draftId });

    expect(draft.published).toBe(false);
  });

  it('throws NotFound (404) for unknown question id', async () => {
    const result = publishQuestion(
      '00000000-0000-0000-0000-000000000000',
      true,
    );

    await expect(result).rejects.toMatchObject({
      code: DomainExceptionCode.NotFound,
    });
  });

  it('rejects publishing a question without correct answers', async () => {
    const id = await createQuestion('Question without any answers', []);

    await expect(publishQuestion(id, true)).rejects.toMatchObject({
      code: DomainExceptionCode.BadRequest,
    });

    const entity = await questionsRepo.findOneByOrFail({ id });

    expect(entity.published).toBe(false);
  });

  it('allows unpublishing a question without correct answers', async () => {
    const id = await createQuestion('Question without any answers', []);

    await questionsRepo.update({ id }, { published: true }); // состояние «опубликован без ответов» — только SQL-ом;

    await publishQuestion(id, false);

    const entity = await questionsRepo.findOneByOrFail({ id });

    expect(entity.published).toBe(false);
  });
});
