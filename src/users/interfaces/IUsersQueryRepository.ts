import { UserOutput } from "users/applications/output/user.output";
import { UsersListPaginatedOutput } from "users/applications/output/users-list-paginated.output";
import { GetUsersListQueryHandler } from "users/applications/query-handlers/get-users-list.query-handler";
import { UserDomain } from "users/domain/user.domain";

export interface IUsersQueryRepository {
  getUsersList(
    queryParam: GetUsersListQueryHandler
  ): Promise<UsersListPaginatedOutput>;

  findByLogin(login: string): Promise<UserDomain | null>;

  findByEmail(email: string): Promise<UserDomain | null>;

  findUserByEmailAndNotConfirmCode(
    emailConfirmCode: string
  ): Promise<UserDomain | null>;

  findUserById(userId: string): Promise<UserOutput | null>;

  findUserByRecoveryCode(recoveryCode: string): Promise<UserDomain | null>;
}
