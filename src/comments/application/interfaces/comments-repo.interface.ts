import { ClientSession } from "mongoose";

import { LikeStatus } from "@core/types/like-status.enum";
import { CommentEntity } from "@comments/domain/entities/comment.entity";

export interface ICommentsRepository {
  findById(commentId: string): Promise<CommentEntity | null>;

  findUserLikeStatus(
    commentId: string,
    userId: string
  ): Promise<LikeStatus | null>;

  upsertCommentLikeStatus(
    likeStatus: LikeStatus,
    commentId: string,
    userId: string,
    likesChange: number,
    disLikesChange: number,
    session: ClientSession
  ): Promise<boolean>;

  updateCommentSave(commentEntity: CommentEntity): Promise<boolean>;

  deleteComment(commentId: string): Promise<boolean>;
}

// ? application слой зависит от абстракций (interfaces) -> infrastructure реализует эти абстракции.
