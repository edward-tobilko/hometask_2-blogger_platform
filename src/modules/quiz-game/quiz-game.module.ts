import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SaQuestionsController } from './questions/api/controllers/sa-questions.controller';
import { CreateQuestionUseCase } from './questions/application/use-cases/create-question.use-case';
import { QuestionOrmEntity } from './questions/infrastructure/schemas/question-orm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionOrmEntity])],
  controllers: [SaQuestionsController],
  providers: [CreateQuestionUseCase],
  exports: [],
})
export class QuizGameModule {}
