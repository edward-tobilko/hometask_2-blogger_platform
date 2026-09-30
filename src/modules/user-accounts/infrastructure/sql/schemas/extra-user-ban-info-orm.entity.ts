import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { BaseDBEntity } from 'src/core/base-entity/base-db.entity';
import { UserAccountOrmEntity } from './user-orm.entity';
import { BanUserDomainDto } from 'src/modules/user-accounts/domain/dto/ban-user.dto';
import { calculateExpiresAt } from 'src/core/utils/calculate-expires-at.util';

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

  banUnBan(dto: BanUserDomainDto): void {
    if (dto.isBanned === true) {
      this.isBanned = true; // бан
      this.banReason = dto.banReason; // причина
      this.bannedAt = new Date(); // когда забанен (дата в текущий момент)
      this.banExpiresAt = calculateExpiresAt(dto.banExpiresAt); // к какой дате и времени будет анбан
    } else if (dto.isBanned === false) {
      this.isBanned = false;
      this.banReason = null;
      this.bannedAt = null;
      this.banExpiresAt = null;
    }
  }
}
