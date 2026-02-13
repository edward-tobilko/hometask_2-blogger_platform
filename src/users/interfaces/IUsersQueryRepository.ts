import { UserOutput } from "users/applications/output/user.output";
import { UsersListPaginatedOutput } from "users/applications/output/users-list-paginated.output";
import { GetUsersListQueryHandler } from "users/applications/query-handlers/get-users-list.query-handler";
import { UserDocument } from "users/mongoose/user-schema.mongoose";

export interface IUsersQueryRepository {
  getUsersList(
    queryParam: GetUsersListQueryHandler
  ): Promise<UsersListPaginatedOutput>;

  findByLogin(login: string): Promise<UserDocument | null>;

  findByEmail(email: string): Promise<UserDocument | null>;

  findUserByEmailAndNotConfirmCode(
    emailConfirmCode: string
  ): Promise<UserDocument | null>;

  findUserById(userId: string): Promise<UserOutput | null>;

  findUserByRecoveryCode(recoveryCode: string): Promise<UserDocument | null>;
}
