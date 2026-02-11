import { UsersListPaginatedOutput } from "../output/users-list-paginated.output";
import { UserOutput } from "../output/user.output";
import { UserDomain } from "users/domain/user.domain";

export const mapToUsersListOutput = (
  users: UserDomain[],
  meta: { pageNumber: number; pageSize: number; totalCount: number }
): UsersListPaginatedOutput => {
  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.pageNumber,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,

    items: users.map(
      (user): UserOutput => ({
        id: user.id!.toString(),
        login: user.login,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      })
    ),
  };
};
