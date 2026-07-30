import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  UserAccount,
  UserAccountDocument,
  UserAccountModel,
} from '../../domain/entities/user.entity';

@Injectable()
export class UsersExternalRepository {
  constructor(
    @InjectModel(UserAccount.name)
    private userModel: UserAccountModel,
  ) {}

  async findById(userId: string): Promise<UserAccountDocument | null> {
    return this.userModel
      .findOne({
        _id: userId,

        deletedAt: null, // для того, что бы не находить лишний раз удаленного пользователя
      })
      .exec();
  }

  // * Extra method over the basic API logic
  async findByTelegramConfirmationCode(
    code: string,
  ): Promise<UserAccountDocument | null> {
    return this.userModel
      .findOne({
        telegramConfirmationCode: code,

        deletedAt: null,
      })
      .exec();
  }

  async save(user: UserAccountDocument): Promise<void> {
    await user.save();
  }
}

// ? External - то что мы хотим переиспользовать снаруже (за пределами UserAccountModule), что бы не шарить все данные с репо.
