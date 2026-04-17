import { PostViewModel } from './post.view-model';

export class PostsPaginatedViewModel {
  constructor(
    public pagesCount: number,
    public page: number,
    public pageSize: number,
    public totalCount: number,

    public items: PostViewModel[],
  ) {}
}
