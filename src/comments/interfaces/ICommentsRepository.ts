import { LikeStatus } from "@core/types/like-status.enum";
import { UpdateCommentDtoCommand } from "comments/application/commands/update-comment-dto.command";

export interface ICommentsRepository {
  // getCommentDomainById(commentId: string): Promise<PostCommentDomain | null>;

  deleteCommentById(commentId: string): Promise<boolean>;

  updateCommentById(dto: UpdateCommentDtoCommand): Promise<boolean>;

  updateCommentLikeStatusById(dto: {
    likeStatus: LikeStatus;
    commentId: string;
    userId: string;
  }): Promise<boolean>;
}
