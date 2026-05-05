import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateUserInterface } from 'src/modules/user-accounts/domain/interfaces/create-user-interface';
import {
  UserAccount,
  UserAccountDocument,
  UserAccountModel,
} from 'src/modules/user-accounts/domain/entities/user.entity';

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

  async save(user: UserAccountDocument): Promise<void> {
    await user.save();
  }

  async create(dto: CreateUserInterface): Promise<UserAccountDocument> {
    const user = this.userModel.createUserInstance({
      ...dto,
    });

    await user.save();

    return user;
  }

  async createByAdmin(dto: CreateUserInterface): Promise<UserAccountDocument> {
    const user = this.userModel.createAdminUserInstance({
      ...dto,
    });

    await user.save();

    return user;
  }

  async delete(id: string): Promise<void> {
    await this.userModel.deleteOne({ _id: id }).exec();
  }
}
