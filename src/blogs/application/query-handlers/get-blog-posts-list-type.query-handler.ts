import { PaginationSorting } from "../../../core/types/pagination-sorting.type";
import { PostSortField } from "../../../posts/routes/request-payloads/post-sort-field.request-payload";

export type GetBlogPostsListQueryHandler = PaginationSorting<PostSortField> &
  Partial<{ blogId: string }>;
