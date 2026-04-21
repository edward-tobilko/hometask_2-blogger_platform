import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDomainDto } from 'src/users/domain/dto/create-user-domain.dto';

import {
  User,
  UserDocument,
  UserModel,
} from 'src/users/domain/entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: UserModel) {}

  async findById(id: string): Promise<UserDocument | null> {
    const existingUser = await this.userModel
      .findOne({
        _id: id,
        deletedAt: null, // для того, что бы не находить лишний раз удаленного пользователя
      })
      .exec();

    return existingUser;
  }

  async save(user: UserDocument): Promise<void> {
    await user.save();
  }

  async create(dto: CreateUserDomainDto): Promise<UserDocument> {
    const user = this.userModel.createInstance({
      ...dto,
    });

    await user.save();

    return user;
  }

  findUserByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        $or: [{ login }, { email }],
        deletedAt: null,
      })
      .exec();
  }
}
