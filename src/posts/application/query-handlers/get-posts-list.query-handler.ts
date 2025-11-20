import { PaginationSorting } from "../../../core/types/pagination-sorting.type";
import { PostSortField } from "../../routes/request-payloads/post-sort-field.request-payload";

export type GetPostsListQueryHandler = PaginationSorting<PostSortField>;
