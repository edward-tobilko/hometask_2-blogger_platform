import { UserSortFieldRP } from "../../routes/request-payload-types/user-sort-field.request-payload-types";
import { PaginationSorting } from "../../../core/types/pagination-sorting.type";

export type GetUsersListQueryHandler = PaginationSorting<UserSortFieldRP> &
  Partial<{ searchLoginTerm?: string; searchEmailTerm?: string }>;
