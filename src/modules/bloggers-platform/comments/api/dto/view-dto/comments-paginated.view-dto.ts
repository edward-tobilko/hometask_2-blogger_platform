import { CommentViewModel } from './comment.view-dto';

export class CommentsPaginatedViewModel {
  constructor(
    public pagesCount: number,
    public page: number,
    public pageSize: number,
    public totalCount: number,

    public items: CommentViewModel[],
  ) {}
}
