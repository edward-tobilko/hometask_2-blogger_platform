import { Column, Entity, OneToOne } from 'typeorm';
import { randomUUID } from 'crypto';

import { BaseDBEntity } from 'src/core/base-entity/base-db.entity';
import { ExtraUserBanInfoOrmEntity } from './extra-user-ban-info-orm.entity';
import { CreateUserDomainDto } from 'src/modules/user-accounts/domain/dto/create-user.dto';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

@Entity('user_accounts') // in SQL the convention is 'snake_case'
export class UserAccountOrmEntity extends BaseDBEntity {
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

  // * Extra fields over the basic API logic
  // * Вложеный обьект (сплющенные поля) "telegramNotification"
  @Column({ name: 'telegram_chat_id', type: 'varchar', nullable: true })
  telegramChatId!: string | null;

  @Column({
    name: 'telegram_confirmation_code',
    type: 'varchar',
    default: null,
    nullable: true,
  })
  telegramConfirmationCode!: string | null;

  // * Joins
  @OneToOne(
    () => ExtraUserBanInfoOrmEntity,
    (userBanInfo) => userBanInfo.userAccount,
    {
      cascade: true,
    },
  )
  userBanInfo!: ExtraUserBanInfoOrmEntity;

  static create(
    dto: CreateUserDomainDto,
    isConfirmed: boolean,
  ): UserAccountOrmEntity {
    const userInstance = new UserAccountOrmEntity();

    userInstance.login = dto.login;
    userInstance.email = dto.email;
    userInstance.passwordHash = dto.password;
    userInstance.confirmationCode = null;
    userInstance.emailConfirmationCodeExpiry = null;
    userInstance.isConfirmed = isConfirmed;

    return userInstance;
  }

  static createForRegistration(dto: CreateUserDomainDto): UserAccountOrmEntity {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    const userInstance = new UserAccountOrmEntity();
    userInstance.login = dto.login;
    userInstance.email = dto.email;
    userInstance.passwordHash = dto.password;
    userInstance.confirmationCode = randomUUID();
    userInstance.emailConfirmationCodeExpiry = expirationDate;
    userInstance.isConfirmed = false;

    return userInstance;
  }

  confirmEmail(nowDate: Date = new Date()): void {
    if (this.isConfirmed === true)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is already confirmed',
        extensions: [new Extension('Email is already confirmed', 'code')],
      });

    if (
      !this.emailConfirmationCodeExpiry ||
      this.emailConfirmationCodeExpiry < nowDate
    )
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Confirmation code is expired or already been applied',
        extensions: [
          new Extension(
            'Confirmation code is expired or already been applied',
            'code',
          ),
        ],
      });

    this.emailConfirmationCodeExpiry = null;
    this.isConfirmed = true;
  }

  resendEmail(): void {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1); // set new deadline

    this.confirmationCode = randomUUID();
    this.emailConfirmationCodeExpiry = expirationDate;
  }

  setPassword(hash: string): void {
    this.passwordHash = hash;
    this.recoveryCode = null;
    this.recoveryCodeExpiry = null;
  }

  setRecoveryCode(): void {
    // * Set deadline for recovery code
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    this.recoveryCode = randomUUID();
    this.recoveryCodeExpiry = expirationDate;
  }
}
