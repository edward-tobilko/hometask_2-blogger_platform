import { Injectable } from '@nestjs/common';

import { UsersQueryDto } from 'src/modules/user-accounts/api/dto/users-query.dto';
import { UsersPaginatedViewDto } from 'src/modules/user-accounts/api/dto/view/users-paginated-view.dto';
import { UsersQueryRepository } from 'src/modules/user-accounts/infrastructure/repositories/users-query.repository';

@Injectable()
export class UsersQueryService {
  constructor(private readonly usersQueryRepo: UsersQueryRepository) {}

  async getUsersList(query: UsersQueryDto): Promise<UsersPaginatedViewDto> {
    return this.usersQueryRepo.findUsersList(query);
  }
}
