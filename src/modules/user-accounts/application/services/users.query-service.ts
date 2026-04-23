import { Injectable } from '@nestjs/common';

import { UsersQueryInputDto } from 'src/modules/user-accounts/api/input-dto/users-query.input-dto';
import { UsersPaginatedViewDto } from 'src/modules/user-accounts/api/view-dto/users-paginated.view-dto';
import { UsersQueryRepository } from 'src/modules/user-accounts/infrastructure/repositories/users-query.repository';

@Injectable()
export class UsersQueryService {
  constructor(private readonly usersQueryRepo: UsersQueryRepository) {}

  async getUsersList(
    query: UsersQueryInputDto,
  ): Promise<UsersPaginatedViewDto> {
    return this.usersQueryRepo.findUsersList(query);
  }
}
