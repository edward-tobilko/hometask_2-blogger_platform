import { ApplicationResult } from "@core/result/application.result";
import { IPostCommentOutput } from "posts/application/output/post-comment.output";

export interface ICommentsQueryService {
  getCommentById(
    commentId: string
  ): Promise<ApplicationResult<IPostCommentOutput | null>>;
}
