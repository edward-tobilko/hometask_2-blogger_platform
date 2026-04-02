import { IPostCommentOutput } from "@posts/application/output/post-comment.output";

export interface ICommentsQueryRepo {
  findCommentById(
    commentId: string,
    currentUserId?: string
  ): Promise<IPostCommentOutput | null>;
}

// ? application слой зависит от абстракций (interfaces) -> infrastructure реализует эти абстракции.
