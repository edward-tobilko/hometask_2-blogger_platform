import { BlogOutput } from './blog.output';

export type BlogListPaginatedOutput = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;

  items: BlogOutput[];
};
