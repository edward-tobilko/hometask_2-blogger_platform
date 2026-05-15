import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UsersQueryRepository } from '../../infrastructure/repositories/users-query.repository';
import { UsersPaginatedViewDto } from '../../api/view-dto/users-paginated.view-dto';
import { UsersQueryInputDto } from 'src/modules/user-accounts/api/input-dto/users-query.input-dto';

export class GetUsersListQuery {
  constructor(public query: UsersQueryInputDto) {}
}

@QueryHandler(GetUsersListQuery)
export class GetUsersListHandler implements IQueryHandler<
  GetUsersListQuery,
  UsersPaginatedViewDto
> {
  constructor(private usersQueryRepo: UsersQueryRepository) {}

  async execute({ query }: GetUsersListQuery): Promise<UsersPaginatedViewDto> {
    return this.usersQueryRepo.findUsersList(query);
  }
}
