import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';

import { CreateUserInterface } from '../interfaces/create-user-interface';
import { FullName, FullNameSchema } from './full-name.entity';
import {
  EmailConfirmation,
  EmailConfirmationSchema,
} from './email-confirm-code.entity';

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
    unique: true, // уникальный индекс, что бы защититься на уровне БД (страховка, если два однаковых запроса придут одновременно)
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

  // * обьект для подтв. кода
  @Prop({ type: EmailConfirmationSchema })
  emailConfirmation!: EmailConfirmation;

  private static buildBaseUserInstance(dto: CreateUserInterface) {
    const user = new this(); // -> UserModel

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;

    return user;
  }

  static createUserInstance(dto: CreateUserInterface): UserAccountDocument {
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
    dto: CreateUserInterface,
  ): UserAccountDocument {
    const user = this.buildBaseUserInstance(dto);

    // * регистрируем сразу пользователя
    user.emailConfirmation = {
      confirmationCode: null,
      emailConfirmationCodeExpiry: null,
      isConfirmed: true,
    };

    return user as UserAccountDocument;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }

    this.deletedAt = new Date();
  }
}

export const UserAccountSchema = SchemaFactory.createForClass(UserAccount);

UserAccountSchema.loadClass(UserAccount);

export type UserAccountDocument = HydratedDocument<UserAccount>;
export type UserAccountLean = UserAccount & { _id: Types.ObjectId };

export type UserAccountModel = Model<UserAccountDocument> & typeof UserAccount;
