import { WithId } from "mongodb";

import { UserDomain } from "../../domain/user.domain";
import { UsersListPaginatedOutput } from "../output/users-list-paginated.output";
import { UserOutput } from "../output/user.output";

export const mapToUsersListOutput = (
  usersDB: WithId<UserDomain>[],
  meta: { pageNumber: number; pageSize: number; totalCount: number }
): UsersListPaginatedOutput => {
  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.pageNumber,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,

    items: usersDB.map(
      (userDB): UserOutput => ({
        id: userDB._id.toString(),
        login: userDB.login,
        email: userDB.email,
        createdAt: userDB.createdAt.toISOString(),
      })
    ),
  };
};
