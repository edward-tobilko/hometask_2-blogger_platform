import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDomainDto } from 'src/modules/user-accounts/domain/dto/create-user-domain.dto';

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

  async save(user: UserAccountDocument): Promise<void> {
    await user.save();
  }

  async create(dto: CreateUserDomainDto): Promise<UserAccountDocument> {
    const user = this.userModel.createInstance({
      ...dto,
    });

    await user.save();

    return user;
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
}
