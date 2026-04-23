import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { PaginatedViewDto } from 'src/core/dto/paginated-view.dto';
import { UsersQueryInputDto } from 'src/modules/user-accounts/api/input-dto/users-query.input-dto';
import { UserViewDto } from 'src/modules/user-accounts/api/view-dto/user.view-dto';
import { UsersPaginatedViewDto } from 'src/modules/user-accounts/api/view-dto/users-paginated.view-dto';
import {
  UserAccount,
  UserAccountLean,
  UserAccountModel,
} from 'src/modules/user-accounts/domain/entities/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(UserAccount.name) protected userModel: UserAccountModel,
  ) {}

  async findUsersList(
    query: UsersQueryInputDto,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const { pageNumber, pageSize, searchEmailTerm, searchLoginTerm } = query;

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
        .sort(query.calculateSort())
        .skip(query.calculateSkip())
        .limit(pageSize)
        .lean<UserAccountLean[]>()
        .exec(),

      this.userModel.countDocuments(filter),
    ]);

    return UsersPaginatedViewDto.mapToView({
      page: pageNumber,
      pageSize,
      totalCount,

      items: usersDocument.map(UserViewDto.mapToViewModel),
    });
  }
}
