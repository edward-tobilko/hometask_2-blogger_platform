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
import { ICommentsService } from "comments/application/interfaces/comments-service.interface";
import { LikeStatus } from "@core/types/like-status.enum";
import { LikeEntity } from "@core/domain/entities/like.entity";
import { ICommentsRepository } from "../interfaces/comments-repo.interface";

@injectable()
export class CommentsService implements ICommentsService {
  constructor(
    @inject(DiTypes.ICommentsRepository)
    private commentsRepo: ICommentsRepository
  ) {}

  async upsertCommentLikeStatus(domain: {
    likeStatus: LikeStatus;
    commentId: string;
    userId: string;
  }): Promise<ApplicationResult<null>> {
    const { likeStatus, commentId, userId } = domain;

    const session = await mongoose.startSession(); // * позволяет объединить несколько запросов в одну транзакцию. Без session каждый updateOne() — это отдельная операция.

    try {
      // * Проверяем существование комментария внутри сессии
      const existingComment = await this.commentsRepo.findById(commentId);

      if (!existingComment) {
        return new ApplicationResult({
          status: ApplicationResultStatus.NotFound,
          data: null,
          extensions: [new NotFoundError("comment is not found", "commentId")],
        });
      }

      const prevStatus = await this.commentsRepo.findUserLikeStatus(
        commentId,
        userId
      );
      const nextStatus = likeStatus;

      if (prevStatus === nextStatus) {
        return new ApplicationResult({
          status: ApplicationResultStatus.NoContent,
          data: null,
          extensions: [],
        });
      }

      // * Domain
      const { likesChange, disLikesChange } = LikeEntity.calculateLikeDislike(
        prevStatus ?? LikeStatus.None,
        nextStatus
      );

      let operationSuccess = false;

      // * session.withTransaction() - все внутри либо выполнится целиком, либо откатится полностью (если хоть один запросс не сработает: $inc или $upsert).
      await session.withTransaction(async () => {
        // * Обновляем статус в репозитории
        operationSuccess = await this.commentsRepo.upsertCommentLikeStatus(
          likeStatus,
          commentId,
          userId,
          likesChange,
          disLikesChange,
          session
        );

        if (!operationSuccess) throw new Error("Update failed!");
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

    // * ищем нужный нам коммент (DDD)
    const existingComment = await this.commentsRepo.findById(dto.commentId);

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

    // * обновляем доменную сущность (DDD)
    existingComment.updateComment(dto.content);

    const updated = await this.commentsRepo.updateCommentSave(existingComment);

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
    const comment = await this.commentsRepo.findById(commentId);

    if (!comment) throw new NotFoundError("Comment is not found", "commentId"); // 404

    // * DDD
    comment.canBeDeletedBy(userId);

    const deleted = await this.commentsRepo.deleteComment(commentId);

    if (!deleted) throw new InternalServerError("Failed to delete comment"); // Если не удалился (хотя комментарий существовал) — это ошибка сервера.
  }
}
