import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  UserAccount,
  UserAccountDocument,
  UserAccountModel,
} from 'src/modules/user-accounts/domain/entities/user.entity';
import { CreateUserDomainDto } from '../../../domain/dto/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(UserAccount.name) private userModel: UserAccountModel,
  ) {}

  async findById(id: string): Promise<UserAccountDocument | null> {
    const existingUser = await this.userModel
      .findOne({
        _id: id,

        deletedAt: null, // для того, что бы не находить лишний раз удаленного пользователя
      })
      .exec();

    return existingUser;
  }

  findUserByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<UserAccountDocument | null> {
    return this.userModel
      .findOne({
        $or: [{ login }, { email }],

        deletedAt: null,
      })
      .exec();
  }

  findByEmail(email: string): Promise<UserAccountDocument | null> {
    return this.userModel.findOne({ email, deletedAt: null }).exec();
  }

  findByLogin(login: string): Promise<UserAccountDocument | null> {
    return this.userModel.findOne({ login, deletedAt: null }).exec();
  }

  findByConfirmationCode(
    confirmCode: string,
  ): Promise<UserAccountDocument | null> {
    return this.userModel
      .findOne({
        'emailConfirmation.confirmationCode': confirmCode,

        deletedAt: null,
      })
      .exec();
  }

  findByRecoveryCode(
    recoveryCode: string,
  ): Promise<UserAccountDocument | null> {
    return this.userModel
      .findOne({
        'passwordRecovery.recoveryCode': recoveryCode,

        deletedAt: null,
      })
      .exec();
  }

  async save(user: UserAccountDocument): Promise<void> {
    await user.save();
  }

  async create(dto: CreateUserDomainDto): Promise<UserAccountDocument> {
    const user = this.userModel.createUserInstance({
      ...dto,
    });

    await user.save();

    return user;
  }

  async createByAdmin(
    dto: CreateUserDomainDto,
    isUserConfirmed: boolean,
  ): Promise<UserAccountDocument> {
    const user = this.userModel.createAdminUserInstance(
      {
        ...dto,
      },
      isUserConfirmed,
    );

    await user.save();

    return user;
  }

  async delete(id: string): Promise<void> {
    await this.userModel.deleteOne({ _id: id }).exec();
  }

  // * Extra method over the basic API logic
  async updateBanStatus(user: UserAccountDocument): Promise<void> {
    await this.userModel.updateOne(
      {
        _id: user.id,
      },

      {
        $set: {
          banInfo: {
            isBanned: user.banInfo.isBanned,
            banReason: user.banInfo.banReason,
            bannedAt: user.banInfo.bannedAt,
            banExpiresAt: user.banInfo.banExpiresAt,
          },
        },
      },
    );
  }
}
