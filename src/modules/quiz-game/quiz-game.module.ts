import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SaQuestionsController } from './questions/api/controllers/sa-questions.controller';
import { CreateQuestionUseCase } from './questions/application/use-cases/create-question.use-case';
import { QuestionOrmEntity } from './questions/infrastructure/schemas/question-orm.entity';
import { QuestionsRepository } from './questions/infrastructure/repositories/questions.repo';
import { QuestionsQueryRepository } from './questions/infrastructure/repositories/questions-query.repo';
import { GetQuestionByIdHandler } from './questions/application/queries/get-question-by-id.query';
import { GetAllQuestionsHandler } from './questions/application/queries/get-all-questions-query';
import { DeleteQuestionUseCase } from './questions/application/use-cases/delete-question.use-case';
import { UpdateQuestionUseCase } from './questions/application/use-cases/update-question.use-case';
import { PublishQuestionUseCase } from './questions/application/use-cases/publish-question.use-case';
import { PairGameController } from './pair-game/api/controllers/pair-game.controller';
import { GameOrmEntity } from './pair-game/infrastructure/schemas/game-orm.entity';
import { PlayerProgressOrmEntity } from './pair-game/infrastructure/schemas/player-progress-orm.entity';
import { PairGameRepository } from './pair-game/infrastructure/repositories/pair-game.repo';
import { ConnectToPairUseCase } from './pair-game/application/use-cases/connect-to-pair.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionOrmEntity,
      GameOrmEntity,
      PlayerProgressOrmEntity,
    ]),
  ],

  controllers: [SaQuestionsController, PairGameController],

  providers: [
    CreateQuestionUseCase,
    DeleteQuestionUseCase,
    UpdateQuestionUseCase,
    PublishQuestionUseCase,
    ConnectToPairUseCase,

    GetQuestionByIdHandler,
    GetAllQuestionsHandler,

    QuestionsRepository,
    QuestionsQueryRepository,
    PairGameRepository,
  ],

  exports: [],
})
export class QuizGameModule {}
