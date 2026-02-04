import { ApplicationResult } from "@core/result/application.result";
import { IPostCommentOutput } from "posts/application/output/post-comment.output";

export interface ICommentsQueryService {
  getCommentsListById(
    commentId: string
  ): Promise<ApplicationResult<IPostCommentOutput | null>>;
}
