import { UserOutput } from "@users/application/output/user.output";
import { UsersListPaginatedOutput } from "@users/application/output/users-list-paginated.output";
import { GetUsersListQueryHandler } from "@users/application/query-handlers/get-users-list.query-handler";

export interface IUsersQueryService {
  getUsersList(
    queryParam: GetUsersListQueryHandler
  ): Promise<UsersListPaginatedOutput>;

  getUserById(userId: string): Promise<UserOutput | null>;
}
