import { UsersQueryRepository } from "../repositories/users-query.repository";
import { GetUsersListQueryHandler } from "./query-handlers/get-users-list.query-handler";

class UserQueryService {
  constructor(private usersQueryRepository = new UsersQueryRepository()) {}

  async getUsersList(queryParam: GetUsersListQueryHandler): Promise<any> {
    return await this.usersQueryRepository.getUsersQueryRepo(queryParam);
  }
}

export const userQueryService = new UserQueryService();
