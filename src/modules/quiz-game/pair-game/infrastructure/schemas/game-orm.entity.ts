import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { GameStatusEnum } from '../../domain/game-status.enum';

// * Таблица для записи ручки ".../connection".
@Entity({ name: 'quiz_games' })
export class GameOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ enum: GameStatusEnum, type: 'enum' })
  status!: GameStatusEnum;

  @CreateDateColumn({ name: 'pair_created_date', type: 'timestamptz' })
  pairCreatedDate!: Date;

  @Column({ name: 'start_game_date', type: 'timestamptz', nullable: true })
  startGameDate!: Date | null;

  @Column({ name: 'finish_game_date', type: 'timestamptz', nullable: true })
  finishGameDate!: Date | null;
}
