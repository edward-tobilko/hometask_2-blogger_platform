import { ApplicationResult } from "@core/result/application.result";
import { LikeStatus } from "@core/types/like-status.enum";
import { WithMeta } from "@core/types/with-meta.type";
import { UpdateCommentDtoCommand } from "@comments/application/commands/update-comment-dto.command";

export interface ICommentsService {
  upsertCommentLikeStatus(domain: {
    likeStatus: LikeStatus;
    commentId: string;
    userId: string;
  }): Promise<ApplicationResult<null>>;

  updateComment(
    command: WithMeta<UpdateCommentDtoCommand>,
    userId: string
  ): Promise<ApplicationResult<null>>;

  deleteComment(commentId: string, userId: string): Promise<void>;
}

// ? application слой зависит от абстракций (interfaces) -> infrastructure реализует эти абстракции.
