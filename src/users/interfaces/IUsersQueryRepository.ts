import { UserDB } from "db/types.db";
import { UserOutput } from "users/applications/output/user.output";
import { UsersListPaginatedOutput } from "users/applications/output/users-list-paginated.output";
import { GetUsersListQueryHandler } from "users/applications/query-handlers/get-users-list.query-handler";

export interface IUsersQueryRepository {
  getUsersList(
    queryParam: GetUsersListQueryHandler
  ): Promise<UsersListPaginatedOutput>;

  findByLogin(login: string): Promise<UserDB | null>;

  findByEmail(email: string): Promise<UserDB | null>;

  findUserByEmailAndNotConfirmCode(
    emailConfirmCode: string
  ): Promise<UserDB | null>;

  findUserById(userId: string): Promise<UserOutput | null>;
}
