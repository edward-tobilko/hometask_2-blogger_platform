import { ApplicationResult } from "@core/result/application.result";
import { LikeStatus } from "@core/types/like-status.enum";
import { WithMeta } from "@core/types/with-meta.type";
import { UpdateCommentDtoCommand } from "comments/application/commands/update-comment-dto.command";

export interface ICommentsService {
  deleteCommentById(commentId: string, userId: string): Promise<void>;

  updateComment(
    command: WithMeta<UpdateCommentDtoCommand>,
    userId: string
  ): Promise<ApplicationResult<null>>;

  updateCommentLikeStatusById(dto: {
    likeStatus: LikeStatus;
    commentId: string;
    userId: string;
  }): Promise<ApplicationResult<null>>;
}
