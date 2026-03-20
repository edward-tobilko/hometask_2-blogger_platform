import { LikeStatus } from "@core/types/like-status.enum";
import { UpdateCommentDtoCommand } from "comments/application/commands/update-comment-dto.command";
import { CommentEntity } from "comments/domain/entities/comment.entity";

export interface ICommentsRepository {
  findById(commentId: string): Promise<CommentEntity | null>;

  save(comment: CommentEntity): Promise<void>;

  upsertCommentLikeStatus(
    likeStatus: LikeStatus,
    commentId: string,
    userId: string,
    likesChange: number,
    disLikesChange: number
  ): Promise<boolean>;

  updateComment(domain: UpdateCommentDtoCommand): Promise<boolean>;

  deleteComment(commentId: string): Promise<boolean>;
}

// ? application слой зависит от абстракций (interfaces) -> infrastructure реализует эти абстракции.
