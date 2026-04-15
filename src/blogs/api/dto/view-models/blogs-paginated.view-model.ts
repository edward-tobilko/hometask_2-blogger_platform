import { BlogViewModel } from './blog.view-model';

export class BlogListPaginatedViewModel {
  constructor(
    public pagesCount: number,
    public page: number,
    public pageSize: number,
    public totalCount: number,

    public items: BlogViewModel[],
  ) {}
}
