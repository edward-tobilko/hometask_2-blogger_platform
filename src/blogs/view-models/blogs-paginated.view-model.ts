import { BlogViewModel } from './blog.view-model';

export type BlogListPaginatedViewModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;

  items: BlogViewModel[];
};
