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

        deletedAt: null, // что бы не находить лишний раз удаленного пользователя
      })
      .exec();
  }

  async save(user: UserAccountDocument): Promise<void> {
    await user.save();
  }

  // * Extra methods over the basic API logic
  async findByTelegramConfirmationCode(
    code: string,
  ): Promise<UserAccountDocument | null> {
    return this.userModel
      .findOne({
        'telegramNotificationsInfo.telegramConfirmationCode': code,

        deletedAt: null,
      })
      .exec();
  }

  async findByIds(userIds: string[]): Promise<UserAccountDocument[]> {
    return this.userModel
      .find({
        _id: { $in: userIds },

        deletedAt: null,
      })
      .exec();
  }
}
