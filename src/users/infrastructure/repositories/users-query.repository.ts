import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { UsersQueryDto } from 'src/users/api/dto/users-query.dto';
import { UserViewDto } from 'src/users/api/dto/view/user-view.dto';
import { UsersListPaginatedViewModel } from 'src/users/api/dto/view/users-paginated.view';
import {
  User,
  UserLean,
  UserModel,
} from 'src/users/domain/entities/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) protected userModel: UserModel) {}

  async findUsersList(
    query: UsersQueryDto,
  ): Promise<UsersListPaginatedViewModel> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchEmailTerm,
      searchLoginTerm,
    } = query;

    const loginTerm = searchLoginTerm?.trim();
    const emailTerm = searchEmailTerm?.trim();

    const filter: Record<string, unknown> = {
      deletedAt: null, // фильтрация для отсеевания удаленных обьектов с БД
    };

    if (loginTerm && emailTerm) {
      filter.$or = [
        { login: { $regex: loginTerm, $options: 'i' } },
        { email: { $regex: emailTerm, $options: 'i' } },
      ];
    } else if (loginTerm) {
      filter.login = { $regex: loginTerm, $options: 'i' };
    } else if (emailTerm) {
      filter.email = { $regex: emailTerm, $options: 'i' };
    }

    const [usersDocument, totalCount] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean<UserLean[]>()
        .exec(),

      this.userModel.countDocuments(filter),
    ]);

    const usersOutput = new UsersListPaginatedViewModel(
      Math.ceil(totalCount / pageSize),
      pageNumber,
      pageSize,
      totalCount,

      usersDocument.map(UserViewDto.mapToViewModel),
    );

    return usersOutput;
  }
}
