import { IPostCommentOutput } from "./post-comment.output";

export type PostCommentsListPaginatedOutput = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;

  items: IPostCommentOutput[];
};
