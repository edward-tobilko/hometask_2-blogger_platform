import { UserOutput } from "./user.output";

export type UsersListPaginatedOutput = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;

  items: UserOutput[];
};
