import { PaginationSorting } from "../../../core/types/pagination-sorting.type";
import { PostCommentsSortField } from "../../routes/request-payloads/post-sort-fields.request-payload";

export type GetPostCommentsListQueryHandler =
  PaginationSorting<PostCommentsSortField> & Partial<{ postId: string }>;
