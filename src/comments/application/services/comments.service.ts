import { inject, injectable } from "inversify";
import mongoose from "mongoose";

import { WithMeta } from "../../../core/types/with-meta.type";
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "../../../core/errors/application.error";
import { ApplicationResult } from "../../../core/result/application.result";
import { UpdateCommentDtoCommand } from "../commands/update-comment-dto.command";
import { ApplicationResultStatus } from "../../../core/result/types/application-result-status.enum";
import { DiTypes } from "@core/di/types";
import { ICommentsService } from "comments/application/interfaces/ICommentsService";
import { ICommentsRepository } from "comments/application/interfaces/ICommentsRepository";
import { ICommentsQueryRepo } from "comments/application/interfaces/ICommentsQueryRepo";
import { LikeStatus } from "@core/types/like-status.enum";
import { LikeEntity } from "@core/domain/like.domain";

@injectable()
export class CommentsService implements ICommentsService {
  constructor(
    @inject(DiTypes.ICommentsRepository)
    private commentsRepo: ICommentsRepository,
    @inject(DiTypes.ICommentsQueryRepo)
    private commentsQueryRepo: ICommentsQueryRepo
  ) {}

  async upsertCommentLikeStatus(domain: {
    likeStatus: LikeStatus;
    commentId: string;
    userId: string;
  }): Promise<ApplicationResult<null>> {
    const { likeStatus, commentId, userId } = domain;

    const session = await mongoose.startSession(); // * позволяет объединить несколько запросов в одну транзакцию. Без session каждый updateOne() — это отдельная операция.

    const prevStatus = LikeStatus.Dislike;
    const nextStatus = LikeStatus.Like;

    try {
      // * Domain
      const { likesChange, disLikesChange } = LikeEntity.calculateLikeDislike(
        prevStatus,
        nextStatus
      );

      // * session.withTransaction() - все внутри либо выполнится целиком, либо откатится полностью (если хоть один запросс не сработает: $inc или $upsert).
      await session.withTransaction(async () => {
        // * Обновляем статус в репозитории
        const success = await this.commentsRepo.upsertCommentLikeStatus(
          likeStatus,
          commentId,
          userId,
          likesChange,
          disLikesChange
        );

        if (!success) {
          return new ApplicationResult({
            status: ApplicationResultStatus.NotFound,
            data: null,
            extensions: [
              new NotFoundError("comment is not found", "commentId"),
            ],
          });
        }
      });

      return new ApplicationResult({
        status: ApplicationResultStatus.NoContent,
        data: null,
        extensions: [],
      });
    } catch {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new NotFoundError("comment is not found", "commentId")],
      });
    } finally {
      session.endSession();
    }
  }

  async updateComment(
    command: WithMeta<UpdateCommentDtoCommand>,
    userId: string
  ): Promise<ApplicationResult<null>> {
    const dto = command.payload;

    // * ищем нужный нам коммент
    // const existingComment = await this.commentsRepo.getCommentDomainById(
    //   dto.commentId
    // );

    const existingComment = await this.commentsQueryRepo.findCommentById(
      dto.commentId
    );

    if (!existingComment) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new NotFoundError("Comment not found", "commentId")],
      });
    }

    if (existingComment.commentatorInfo.userId !== userId) {
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

    const updated = await this.commentsRepo.updateComment({
      commentId: dto.commentId,
      content: dto.content,
    });

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

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentsQueryRepo.findCommentById(commentId);

    if (!comment) throw new NotFoundError("Comment is not found", "commentId"); // 404

    if (comment.commentatorInfo.userId !== userId) {
      throw new ForbiddenError(
        "You can't delete someone else's comment",
        "userId"
      ); // 403
    }

    const deleted = await this.commentsRepo.deleteComment(commentId);

    if (!deleted) throw new InternalServerError("Failed to delete comment"); // Если не удалился (хотя комментарий существовал) — это ошибка сервера.
  }
}
