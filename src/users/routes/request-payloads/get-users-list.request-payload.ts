import { PaginationSorting } from "../../../core/types/pagination-sorting.type";
import { UserSortField } from "./user-sort-field.request-payload";

export type UsersListRequestPayload = PaginationSorting<UserSortField> & {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
};
