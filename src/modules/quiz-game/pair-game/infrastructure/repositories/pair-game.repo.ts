import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { GameOrmEntity } from '../schemas/game-orm.entity';
import { PlayerProgressOrmEntity } from '../schemas/player-progress-orm.entity';
import { GameStatusEnum } from '../../domain/game-status.enum';

@Injectable()
export class PairGameRepository {
  constructor(
    @InjectRepository(GameOrmEntity)
    private gameRepo: Repository<GameOrmEntity>,

    @InjectRepository(PlayerProgressOrmEntity)
    private playerProgressRepo: Repository<PlayerProgressOrmEntity>,
  ) {}

  async saveGame(
    entity: GameOrmEntity,
    manager: EntityManager,
  ): Promise<GameOrmEntity> {
    return manager.getRepository(GameOrmEntity).save(entity);
  }

  async savePlayerProgress(
    entity: PlayerProgressOrmEntity,
    manager: EntityManager,
  ): Promise<PlayerProgressOrmEntity> {
    return manager.getRepository(PlayerProgressOrmEntity).save(entity);
  }

  async findUnfinishedGameProgressByUserId(
    userId: string,
  ): Promise<PlayerProgressOrmEntity | null> {
    return this.playerProgressRepo.findOne({
      where: {
        userId,

        // * условие на колонку другой таблицы
        game: {
          status: In([
            GameStatusEnum.PENDING_SECOND_PLAYER,
            GameStatusEnum.ACTIVE,
          ]),
        },
      },

      // * связь
      relations: { game: true },
    });
  }
}
