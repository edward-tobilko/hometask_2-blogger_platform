import { LikeStatus } from "@core/types/like-status.enum";
import { UpdateCommentDtoCommand } from "comments/application/commands/update-comment-dto.command";

export interface ICommentsRepository {
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
