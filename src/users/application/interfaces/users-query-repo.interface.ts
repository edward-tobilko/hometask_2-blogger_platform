import { UserOutput } from "users/application/output/user.output";
import { UsersListPaginatedOutput } from "users/application/output/users-list-paginated.output";
import { GetUsersListQueryHandler } from "users/application/query-handlers/get-users-list.query-handler";
import { UserLean } from "users/infrastructure/schemas/user-schema";

export interface IUsersQueryRepository {
  getUsersList(
    queryParam: GetUsersListQueryHandler
  ): Promise<UsersListPaginatedOutput>;

  findByLogin(login: string): Promise<UserLean | null>;

  findByEmail(email: string): Promise<UserLean | null>;

  findUserById(userId: string): Promise<UserOutput | null>;
}
