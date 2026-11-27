import { GameStatusEnum } from '../../domain/game-status.enum';
import { GameOrmEntity } from '../../infrastructure/schemas/game-orm.entity';

export class PairGameViewModel {
  id!: string;
  status!: GameStatusEnum;
  pairCreatedDate!: string;
  startGameDate!: string | null;
  finishGameDate!: string | null;

  static mapToView(entity: GameOrmEntity): PairGameViewModel {
    const dto = new PairGameViewModel();

    dto.id = entity.id;
    dto.status = entity.status;
    dto.pairCreatedDate = entity.pairCreatedDate.toISOString();
    dto.startGameDate = entity.startGameDate?.toISOString() ?? null;
    dto.finishGameDate = entity.finishGameDate?.toISOString() ?? null;

    return dto;
  }
}
