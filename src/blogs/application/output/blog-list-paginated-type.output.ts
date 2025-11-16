import { BlogOutput } from "./blog-type.output";

export type BlogListPaginatedOutput = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;

  items: BlogOutput[];
};
