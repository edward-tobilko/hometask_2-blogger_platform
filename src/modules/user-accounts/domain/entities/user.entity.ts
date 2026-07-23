import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';

import { CreateUserDomainDto } from '../dto/create-user.dto';
import { FullName, FullNameSchema } from './full-name.entity';
import {
  EmailConfirmation,
  EmailConfirmationSchema,
} from './email-confirm-code.entity';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import {
  PasswordRecovery,
  PasswordRecoverySchema,
} from './password-recovery.entity';

@Schema({ timestamps: true, collection: 'user-accounts' })
export class UserAccount {
  @Prop({
    type: String,
    required: true,
    match: /^[a-zA-Z0-9_-]*$/,
    unique: true, // уникальный индекс, что бы защититься на уровне БД (страховка, если два однаковых запроса придут одновременно)
  })
  login!: string;

  @Prop({
    type: String,
    required: true,
    lowercase: true,
    match: [
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      'Email must be a valid email',
    ],
    min: 5,
    unique: true,
  })
  email!: string;

  @Prop({ type: String, required: true })
  passwordHash!: string;

  @Prop({ type: FullNameSchema })
  fullName!: FullName;

  createdAt!: Date;
  updatedAt!: Date;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;

  // * new object for confirmation code
  @Prop({ type: EmailConfirmationSchema })
  emailConfirmation!: EmailConfirmation;

  // * new object for recovery password
  @Prop({ type: PasswordRecoverySchema })
  passwordRecovery!: PasswordRecovery;

  private static buildBaseUserInstance(dto: CreateUserDomainDto) {
    const user = new this(); // -> UserAccountModel

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.password;

    return user;
  }

  static createUserInstance(dto: CreateUserDomainDto): UserAccountDocument {
    const user = this.buildBaseUserInstance(dto);

    // * устанавлеваем дедлайн для кода
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    // * пользователь ВСЕГДА должен после регистрации подтверждить свой Email (инкапсуляция бизнес-логики в доменном слое).
    user.emailConfirmation = {
      confirmationCode: randomUUID(),
      emailConfirmationCodeExpiry: expirationDate,
      isConfirmed: false,
    };

    return user as UserAccountDocument; // указываем явно, что это mongoose document, потому как typescript думает что этот екземпляр = UserAccount class.
  }

  static createAdminUserInstance(
    dto: CreateUserDomainDto,
    isUserConfirmed: boolean,
  ): UserAccountDocument {
    const user = this.buildBaseUserInstance(dto);

    // * регистрируем сразу пользователя
    user.emailConfirmation = {
      confirmationCode: null,
      emailConfirmationCodeExpiry: null,
      isConfirmed: isUserConfirmed,
    };

    return user as UserAccountDocument;
  }

  makeDeleted(): void {
    if (this.deletedAt !== null) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Entity already deleted',
      });
    }

    this.deletedAt = new Date();
  }

  sendConfirmEmail(code: string): void {
    if (this.emailConfirmation.isConfirmed === true)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is already confirmed',
        extensions: [new Extension('Email is already confirmed', 'code')],
      });

    if (this.emailConfirmation.confirmationCode !== code)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Confirmation code is incorrect',
        extensions: [new Extension('Confirmation code is incorrect', 'code')],
      });

    if (
      !this.emailConfirmation.emailConfirmationCodeExpiry ||
      this.emailConfirmation.emailConfirmationCodeExpiry < new Date()
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

    this.emailConfirmation.emailConfirmationCodeExpiry = null;
    this.emailConfirmation.isConfirmed = true;
  }

  resendConfirmationCode(): void {
    if (this.emailConfirmation.isConfirmed)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is already confirmed',
        extensions: [new Extension('Email is already confirmed', 'email')],
      });

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1); // set new deadline

    this.emailConfirmation.confirmationCode = randomUUID();
    this.emailConfirmation.emailConfirmationCodeExpiry = expirationDate;
  }

  setPasswordRecoveryCode(): void {
    // * set deadline for recovery code
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    this.passwordRecovery = {
      recoveryCode: randomUUID(),
      recoveryCodeExpiry: expirationDate,
    };
  }

  setNewPassword(passwordHash: string) {
    if (
      !this.passwordRecovery.recoveryCode ||
      !this.passwordRecovery.recoveryCodeExpiry ||
      this.passwordRecovery.recoveryCodeExpiry < new Date()
    )
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Recovery code is expired or incorrect',
        extensions: [
          new Extension(
            'Recovery code is expired or incorrect',
            'recoveryCode',
          ),
        ],
      });

    this.passwordHash = passwordHash;
    this.passwordRecovery.recoveryCode = null;
    this.passwordRecovery.recoveryCodeExpiry = null;
  }
}

export const UserAccountSchema = SchemaFactory.createForClass(UserAccount);

UserAccountSchema.loadClass(UserAccount);

export type UserAccountDocument = HydratedDocument<UserAccount>;
export type UserAccountLean = UserAccount & { _id: Types.ObjectId };

export type UserAccountModel = Model<UserAccountDocument> & typeof UserAccount;
