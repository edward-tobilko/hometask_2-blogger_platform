import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UsersPaginatedViewDto } from '../../api/view-dto/users-paginated.view-dto';
import { UsersQueryInputDto } from 'src/modules/user-accounts/api/input-dto/users-query.input-dto';
import { UsersSqlQueryRepository } from '../../infrastructure/sql/repositories/users-sql-query.repository';

export class GetUsersListQuery {
  constructor(public query: UsersQueryInputDto) {}
}

@QueryHandler(GetUsersListQuery)
export class GetUsersListHandler implements IQueryHandler<
  GetUsersListQuery,
  UsersPaginatedViewDto
> {
  constructor(private usersQueryRepo: UsersSqlQueryRepository) {}

  async execute({ query }: GetUsersListQuery): Promise<UsersPaginatedViewDto> {
    return this.usersQueryRepo.findUsersList(query);
  }
}
