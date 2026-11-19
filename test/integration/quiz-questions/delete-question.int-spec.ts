import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';

import { QuestionOrmEntity } from 'src/modules/quiz-game/questions/infrastructure/schemas/question-orm.entity';
import { configModule } from 'src/config/dynamic-config.module';
import { QuizGameModule } from 'src/modules/quiz-game/quiz-game.module';
import { CoreModule } from 'src/core/core.module';
import { CreateQuestionCommand } from 'src/modules/quiz-game/questions/application/use-cases/create-question.use-case';
import { DeleteQuestionCommand } from 'src/modules/quiz-game/questions/application/use-cases/delete-question.use-case';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

describe('Quiz questions — delete (integration)', () => {
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

  const createQuestion = async (body: string): Promise<string> => {
    const { id } = await commandBus.execute(
      new CreateQuestionCommand({ body, correctAnswers: ['answer'] }),
    );

    return id;
  };

  const deleteQuestion = (id: string) =>
    commandBus.execute(new DeleteQuestionCommand(id));

  it('removes the question row from the database', async () => {
    const id = await createQuestion('Question that will be deleted');

    await deleteQuestion(id);

    const result = await questionsRepo.existsBy({ id });

    expect(result).toBe(false);
  });

  it('deletes only the requested question, others stay untouched', async () => {
    const deletedId = await createQuestion('Question that will be deleted');
    const keptId = await createQuestion('Question that must stay');

    await deleteQuestion(deletedId);

    const countQuestions = await questionsRepo.count();
    const keptQuestion = await questionsRepo.existsBy({ id: keptId });

    expect(countQuestions).toBe(1);
    expect(keptQuestion).toBe(true);
  });

  it('throws NotFound (404) for unknown question id', async () => {
    const result = deleteQuestion('00000000-0000-0000-0000-000000000000');

    await expect(result).rejects.toMatchObject({
      code: DomainExceptionCode.NotFound,
    });
  });

  it('throws NotFound (404) when the same question is deleted twice', async () => {
    const id = await createQuestion('Question deleted twice');

    await deleteQuestion(id);

    await expect(deleteQuestion(id)).rejects.toMatchObject({
      code: DomainExceptionCode.NotFound,
    });
  });
});
