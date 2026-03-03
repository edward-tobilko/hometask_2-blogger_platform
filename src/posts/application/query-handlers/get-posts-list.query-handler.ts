import { PaginationSorting } from "../../../core/types/pagination-sorting.type";
import { PostSortFieldRP } from "../../presentation/request-payload-types/post-sort-field.request-payload-types";

export type GetPostsListQueryHandler = PaginationSorting<PostSortFieldRP> &
  Partial<{ blogId: string }>;
