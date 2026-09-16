import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { BaseDBEntity } from 'src/core/base-entity/base-db.entity';
import { UserAccountOrmEntity } from './user-orm.entity';

@Entity('users_ban_info')
export class ExtraUserBanInfoOrmEntity extends BaseDBEntity {
  @Column({ name: 'is_banned', type: Boolean, default: false })
  isBanned!: boolean;

  @Column({
    name: 'ban_reason',
    type: 'varchar',
    default: null,
    nullable: true,
  })
  banReason!: string | null;

  @Column({
    name: 'banned_at',
    type: 'timestamptz',
    default: null,
    nullable: true,
  })
  bannedAt!: Date | null;

  @Column({
    name: 'ban_expires_at',
    type: 'timestamptz',
    default: null,
    nullable: true,
  })
  banExpiresAt!: Date | null;

  // * Joins
  @OneToOne(
    () => UserAccountOrmEntity,
    (userAccount) => userAccount.userBanInfo,
    { nullable: true },
  )
  @JoinColumn({ name: 'user_account_id' }) // FK
  userAccount!: UserAccountOrmEntity;
}
