import { PaginationSorting } from "../../../core/types/pagination-sorting.type";
import { PostSortField } from "../../../posts/types/post.types";

export type GetBlogPostsListQueryHandler = PaginationSorting<PostSortField> &
  Partial<{ blogId: string }>;
