import { PaginationSorting } from "../../../core/types/pagination-sorting.type";
import { PostSortField } from "../../../posts/routes/request-payload-types/post-sort-field.request-payload-types";

export type GetBlogPostsListQueryHandler = PaginationSorting<PostSortField> &
  Partial<{ blogId: string }>;
