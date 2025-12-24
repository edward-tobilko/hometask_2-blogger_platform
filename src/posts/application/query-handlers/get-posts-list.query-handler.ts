import { PaginationSorting } from "../../../core/types/pagination-sorting.type";
import { PostSortField } from "../../routes/request-payloads/post-sort-fields.request-payload";

export type GetPostsListQueryHandler = PaginationSorting<PostSortField> &
  Partial<{ blogId: string }>;
