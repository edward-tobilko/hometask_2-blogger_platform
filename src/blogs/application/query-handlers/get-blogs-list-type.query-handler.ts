import { PaginationSorting } from "../../../core/types/pagination-sorting.type";
import { BlogSortField } from "../../routes/request-payloads/blog-sort-field.request-payload";

export type GetBlogsListQueryHandler = PaginationSorting<BlogSortField> &
  Partial<{ searchNameTerm: string; blogId: string }>;
