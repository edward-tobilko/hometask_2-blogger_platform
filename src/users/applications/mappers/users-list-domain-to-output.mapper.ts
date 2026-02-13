import { UsersListPaginatedOutput } from "../output/users-list-paginated.output";
import { UserOutput } from "../output/user.output";
import { UserPlaneObj } from "users/mongoose/user-schema.mongoose";

export const mapToUsersListOutput = (
  users: UserPlaneObj[],
  meta: { pageNumber: number; pageSize: number; totalCount: number }
): UsersListPaginatedOutput => {
  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.pageNumber,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,

    items: users.map(
      (user): UserOutput => ({
        id: user._id!.toString(),
        login: user.login,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      })
    ),
  };
};
