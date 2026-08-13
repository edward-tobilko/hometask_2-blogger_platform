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

  // * EmailConfirmation (сплющенные поля)
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

  // * PasswordRecovery (сплющенные поля)
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
}
