import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

import { CreateUserDomainDto } from '../dto/create-user-domain.dto';

@Schema({ timestamps: true })
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
    unique: true, // уникальный индекс, что бы защититься на уровне БД (страховка, если два однаковых запроса придут одновременно)
  })
  email!: string;

  @Prop({ type: String, required: true })
  passwordHash!: string;

  @Prop({ type: Boolean, required: true, default: false })
  isEmailConfirmed!: boolean;

  //   @Prop({ type: NameSchema })
  //   name!: Name;

  createdAt!: Date;
  updatedAt!: Date;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;

  static createInstance(dto: CreateUserDomainDto): UserAccountDocument {
    const user = new this(); // -> UserModel

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;

    user.isEmailConfirmed = false; // пользователь ВСЕГДА должен после регистрации подтверждить свой Email (инкапсуляция бизнес-логики в доменном слое).

    // user.name = {
    //   firstName: 'firstName xxx',
    //   lastName: 'lastName yyy',
    // };

    return user as UserAccountDocument;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }

    this.deletedAt = new Date();
  }

  //   update(dto: UpdateUserDto) {
  //     if (dto.email !== this.email) {
  //       this.isEmailConfirmed = false;
  //     }
  //     this.email = dto.email;
  //   }
}

export const UserAccountSchema = SchemaFactory.createForClass(UserAccount);

UserAccountSchema.loadClass(UserAccount);

export type UserAccountDocument = HydratedDocument<UserAccount>;
export type UserAccountLean = UserAccount & { _id: Types.ObjectId };

export type UserAccountModel = Model<UserAccountDocument> & typeof UserAccount;
