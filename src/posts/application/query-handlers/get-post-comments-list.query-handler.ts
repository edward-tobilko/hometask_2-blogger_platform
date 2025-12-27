import { PaginationSorting } from "../../../core/types/pagination-sorting.type";
import { PostCommentsSortFieldRP } from "../../routes/request-payload-types/post-sort-field.request-payload-types";

export type GetPostCommentsListQueryHandler =
  PaginationSorting<PostCommentsSortFieldRP> & Partial<{ postId: string }>;
