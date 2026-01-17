import { WithMeta } from "./../../core/types/with-meta.type";
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "../../core/errors/application.error";
import { CommentQueryRepo } from "../repositories/comment-query.repository";
import { CommentsRepository } from "../repositories/comments.repository";
import { ApplicationResult } from "../../core/result/application.result";
import { UpdateCommentDtoCommand } from "./commands/update-comment-dto.command";
import { ApplicationResultStatus } from "../../core/result/types/application-result-status.enum";

class CommentsService {
  constructor(
    private commentsRepo = new CommentsRepository(),
    private commentsQueryRepo = new CommentQueryRepo()
  ) {}

  async deleteCommentById(commentId: string, userId: string): Promise<void> {
    const comment =
      await this.commentsQueryRepo.getCommentsByIdQueryRepo(commentId);

    if (!comment) throw new NotFoundError("Comment is not found", "commentId"); // 404

    if (comment.commentatorInfo.userId !== userId) {
      throw new ForbiddenError(
        "You can't delete someone else's comment",
        "userId"
      ); // 403
    }

    return await this.commentsRepo.deleteCommentRepo(commentId); // 204
  }

  async updateComment(
    command: WithMeta<UpdateCommentDtoCommand>,
    userId: string
  ): Promise<ApplicationResult<null>> {
    const dto = command.payload;

    // * ищем нужный нам коммент
    const existingComment = await this.commentsRepo.getCommentDomainById(
      dto.commentId
    );

    if (!existingComment) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new NotFoundError("Comment not found", "commentId")],
      });
    }

    if (existingComment.commentatorInfo.userId.toString() !== userId) {
      return new ApplicationResult({
        status: ApplicationResultStatus.Forbidden,
        data: null,
        extensions: [
          new ForbiddenError("You can't edit someone else's comment", "userId"),
        ],
      });
    }

    // * обновляем доменную сущность
    existingComment.content = dto.content;

    const updated = await this.commentsRepo.updateCommentRepo(existingComment);

    if (!updated) {
      return new ApplicationResult({
        status: ApplicationResultStatus.InternalServerError,
        data: null,
        extensions: [new InternalServerError("Failed to update comment")],
      });
    }

    return new ApplicationResult({
      status: ApplicationResultStatus.NoContent,
      data: null,
      extensions: [],
    });
  }
}

export const commentsService = new CommentsService();
