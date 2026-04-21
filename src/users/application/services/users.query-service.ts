import { Injectable } from '@nestjs/common';

import { UsersQueryDto } from 'src/users/api/dto/users-query.dto';
import { UsersPaginatedViewDto } from 'src/users/api/dto/view/users-paginated-view.dto';
import { UsersQueryRepository } from 'src/users/infrastructure/repositories/users-query.repository';

@Injectable()
export class UsersQueryService {
  constructor(private readonly usersQueryRepo: UsersQueryRepository) {}

  async getUsersList(query: UsersQueryDto): Promise<UsersPaginatedViewDto> {
    return this.usersQueryRepo.findUsersList(query);
  }
}
