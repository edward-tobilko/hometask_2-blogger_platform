import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { GameOrmEntity } from './game-orm.entity';

// * Таблица для чтения ручек ".../:id" and ".../my-current".
@Unique('UQ_players_progress_game_id_user_id', ['gameId', 'userId']) // one progress per user per game — user can't take both seats of a pair;
@Entity({ name: 'players_progress' })
export class PlayerProgressOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'game_id', type: 'uuid' })
  gameId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string; // reference to user_accounts.id (no db FK — other module, by design);

  @Column({ type: 'int', default: 0 })
  score!: number;

  @ManyToOne(() => GameOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'game_id',
    foreignKeyConstraintName: 'FK_players_progress_game_id',
  })
  game!: GameOrmEntity;

  static createPlayerProgress(
    gameId: string,
    userId: string,
  ): PlayerProgressOrmEntity {
    const entity = new PlayerProgressOrmEntity();

    entity.gameId = gameId;
    entity.userId = userId;
    entity.score = 0;

    return entity;
  }
}
