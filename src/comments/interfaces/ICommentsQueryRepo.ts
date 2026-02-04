import { IPostCommentOutput } from "posts/application/output/post-comment.output";

export interface ICommentsQueryRepo {
  getCommentsListById(commentId: string): Promise<IPostCommentOutput | null>;
}
