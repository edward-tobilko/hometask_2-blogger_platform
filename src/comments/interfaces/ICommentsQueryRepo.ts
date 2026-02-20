import { IPostCommentOutput } from "posts/application/output/post-comment.output";

export interface ICommentsQueryRepo {
  getCommentById(
    commentId: string,
    currentUserId?: string
  ): Promise<IPostCommentOutput | null>;
}
