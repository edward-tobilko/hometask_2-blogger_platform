import { UserOutput } from "users/applications/output/user.output";
import { UsersListPaginatedOutput } from "users/applications/output/users-list-paginated.output";
import { GetUsersListQueryHandler } from "users/applications/query-handlers/get-users-list.query-handler";

export interface IUsersQueryService {
  getUsersList(
    queryParam: GetUsersListQueryHandler
  ): Promise<UsersListPaginatedOutput>;

  getUserById(userId: string): Promise<UserOutput | null>;
}
