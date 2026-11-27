import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PairGameRepository } from '../../infrastructure/repositories/pair-game.repo';
import { PairGameViewModel } from '../../api/view-dto/pair-game.view-dto'; // TODO: remove api/ import — return { id } and read view via QueryBus (my-current query);
import { GameOrmEntity } from '../../infrastructure/schemas/game-orm.entity';
import { PlayerProgressOrmEntity } from '../../infrastructure/schemas/player-progress-orm.entity';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

export class ConnectToPairCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectToPairCommand)
export class ConnectToPairUseCase implements ICommandHandler<
  ConnectToPairCommand,
  PairGameViewModel
> {
  constructor(private pairGameRepo: PairGameRepository) {}

  async execute({ userId }: ConnectToPairCommand): Promise<PairGameViewModel> {
    // * При повторном создании игры (connection end-point), делаем проверку на 403.
    const isGameProgress =
      await this.pairGameRepo.findUnfinishedGameProgressByUserId(userId);

    if (isGameProgress) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: `Current user is already participating in active pair`,
      });
    }

    const gameEntity = GameOrmEntity.createPairGame();

    await this.pairGameRepo.saveGame(gameEntity); // TODO: wrap saveGame + savePlayerProgress in a transaction;

    const playerProgressEntity = PlayerProgressOrmEntity.createPlayerProgress(
      gameEntity.id,
      userId,
    );

    await this.pairGameRepo.savePlayerProgress(playerProgressEntity);

    return PairGameViewModel.mapToView(gameEntity);
  }
}
