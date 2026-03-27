import { PaginationSorting } from "../../../core/types/pagination-sorting.type";
import { UserSortFieldRP } from "./user-sort-field.request-payload-types";

export type UsersListRP = PaginationSorting<UserSortFieldRP> & {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
};
