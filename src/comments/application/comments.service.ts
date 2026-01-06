import { WithMeta } from "./../../core/types/with-meta.type";
import {
  ForbiddenError,
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
      await this.commentsQueryRepo.getCommentsByIdQueryRepo(commentId); // 404 if not exist

    if (comment.commentatorInfo.userId !== userId) {
      throw new ForbiddenError(
        "userId",
        "You can't delete someone else's comment"
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

    if (!existingComment)
      throw new NotFoundError("Comment ID is not exist", "commentId"); // 404

    if (existingComment.commentatorInfo.userId.toString() !== userId)
      throw new ForbiddenError(
        "You can't change someone else's content",
        "userId"
      ); // 403

    // * обновляем доменную сущность
    existingComment.content = dto.content;

    await this.commentsRepo.updateCommentRepo(existingComment);

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: null,
      extensions: [],
    });
  }
}

export const commentsService = new CommentsService();
