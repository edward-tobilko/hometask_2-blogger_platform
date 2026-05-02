import { BlogViewModel } from './blog.view-dto';

export class BlogListPaginatedViewModel {
  constructor(
    public pagesCount: number,
    public page: number,
    public pageSize: number,
    public totalCount: number,

    public items: BlogViewModel[],
  ) {}
}
