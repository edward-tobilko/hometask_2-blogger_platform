import { inject, injectable } from "inversify";

import { IUsersQueryService } from "@users/application/interfaces/users-query-service.interface";
import { DiTypes } from "@core/di/types";
import { IUsersQueryRepository } from "@users/application/interfaces/users-query-repo.interface";
import { GetUsersListQueryHandler } from "../query-handlers/get-users-list.query-handler";
import { UsersListPaginatedOutput } from "../output/users-list-paginated.output";
import { UserOutput } from "../output/user.output";

@injectable()
export class UsersQueryService implements IUsersQueryService {
  constructor(
    @inject(DiTypes.IUsersQueryRepository)
    private usersQueryRepository: IUsersQueryRepository
  ) {}

  async getUsersList(
    queryParam: GetUsersListQueryHandler
  ): Promise<UsersListPaginatedOutput> {
    return await this.usersQueryRepository.getUsersList(queryParam);
  }

  async getUserById(userId: string): Promise<UserOutput | null> {
    return await this.usersQueryRepository.findUserById(userId);
  }
}
