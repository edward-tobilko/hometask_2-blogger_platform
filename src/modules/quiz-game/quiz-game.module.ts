import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SaQuestionsController } from './questions/api/controllers/sa-questions.controller';
import { CreateQuestionUseCase } from './questions/application/use-cases/create-question.use-case';
import { QuestionOrmEntity } from './questions/infrastructure/schemas/question-orm.entity';
import { QuestionsRepository } from './questions/infrastructure/repositories/questions.repo';
import { QuestionsQueryRepository } from './questions/infrastructure/repositories/questions-query.repo';
import { GetQuestionByIdHandler } from './questions/application/queries/get-question-by-id.query';
import { GetAllQuestionsHandler } from './questions/application/queries/get-all-questions-query';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionOrmEntity])],
  controllers: [SaQuestionsController],
  providers: [
    CreateQuestionUseCase,

    GetQuestionByIdHandler,
    GetAllQuestionsHandler,

    QuestionsRepository,
    QuestionsQueryRepository,
  ],
  exports: [],
})
export class QuizGameModule {}
