import { UsersQueryRepository } from "../repositories/users-query.repository";
import { UsersListPaginatedOutput } from "./output/users-list-paginated.output";
import { GetUsersListQueryHandler } from "./query-handlers/get-users-list.query-handler";

class UserQueryService {
  constructor(private usersQueryRepository = new UsersQueryRepository()) {}

  async getUsersList(
    queryParam: GetUsersListQueryHandler
  ): Promise<UsersListPaginatedOutput> {
    return await this.usersQueryRepository.getUsersListQueryRepo(queryParam);
  }
}

export const userQueryService = new UserQueryService();
