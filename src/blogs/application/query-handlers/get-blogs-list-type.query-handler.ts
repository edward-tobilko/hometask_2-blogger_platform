import { PaginationSorting } from "../../../core/types/pagination-sorting.type";
import { BlogSortFieldRP } from "../../routes/request-payload-types/blog-sort-field.request-payload-type";

export type GetBlogsListQueryHandler = PaginationSorting<BlogSortFieldRP> &
  Partial<{ searchNameTerm: string }>;
