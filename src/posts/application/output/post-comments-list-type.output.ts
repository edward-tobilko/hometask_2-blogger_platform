import { PostCommentOutput } from "./post-comment-type.output";

export type PostCommentsListPaginatedOutput = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;

  items: PostCommentOutput[];
};
