import { BlogSortFieldRP } from "blogs/presentation/request-payload-types/blog-sort-field.request-payload-type";
import { PaginationSorting } from "../../../core/types/pagination-sorting.type";

export type GetBlogsListQueryHandler = PaginationSorting<BlogSortFieldRP> &
  Partial<{ searchNameTerm: string }>;
