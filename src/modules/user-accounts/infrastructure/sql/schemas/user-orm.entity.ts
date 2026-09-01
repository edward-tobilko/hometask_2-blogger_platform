import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_accounts') // in SQL the convention is 'snake_case'
export class UserAccountOrmEntity {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id!: string;

  @Column({ unique: true })
  login!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  // * Вложеный обьект (сплющенные поля) "emailConfirmation"
  @Column({ name: 'confirmation_code', type: 'uuid', nullable: true })
  confirmationCode!: string | null;

  @Column({
    name: 'email_confirmation_code_expiry',
    type: 'timestamptz', // for dates in production always use 'timestamptz' (with time zone)
    nullable: true,
  })
  emailConfirmationCodeExpiry!: Date | null;

  @Column({ name: 'is_confirmed', default: false })
  isConfirmed!: boolean;

  // * Вложеный обьект (сплющенные поля) "passwordRecovery"
  @Column({ name: 'recovery_code', type: 'uuid', nullable: true })
  recoveryCode!: string | null;

  @Column({ name: 'recovery_code_expiry', type: 'timestamptz', nullable: true })
  recoveryCodeExpiry!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt!: Date | null;

  // * Extra fields over the basic API logic
  // * Вложеный обьект (сплющенные поля) "telegramNotification"
  @Column({ name: 'telegram_chat_id', type: 'uuid', nullable: true })
  telegramChatId!: string | null;

  @Column({
    name: 'telegram_confirmation_code',
    type: 'varchar',
    default: null,
    nullable: true,
  })
  telegramConfirmationCode!: string | null;

  // * Вложеный обьект (сплющенные поля) "banInfo"
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
}
