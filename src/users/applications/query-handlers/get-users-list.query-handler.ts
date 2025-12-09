import { UserSortField } from "./../../routes/request-payloads/user-sort-field.request-payload";
import { PaginationSorting } from "../../../core/types/pagination-sorting.type";

export type GetUsersListQueryHandler = PaginationSorting<UserSortField> &
  Partial<{ searchLoginTerm?: string; searchEmailTerm?: string }>;
