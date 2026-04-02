import { ApplicationResult } from "@core/result/application.result";
import { IPostCommentOutput } from "@posts/application/output/post-comment.output";

export interface ICommentsQueryService {
  getCommentById(
    commentId: string,
    currentUserId: string
  ): Promise<ApplicationResult<IPostCommentOutput | null>>;
}

// ? application слой зависит от абстракций (interfaces) -> infrastructure реализует эти абстракции.
