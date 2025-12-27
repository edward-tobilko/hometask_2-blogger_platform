import { PaginationSorting } from "../../../core/types/pagination-sorting.type";
import { PostSortFieldRP } from "../../../posts/routes/request-payload-types/post-sort-field.request-payload-types";

export type GetBlogPostsListQueryHandler = PaginationSorting<PostSortFieldRP> &
  Partial<{ blogId: string }>;
