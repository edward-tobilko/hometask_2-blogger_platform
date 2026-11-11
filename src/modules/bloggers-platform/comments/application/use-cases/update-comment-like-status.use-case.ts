import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { calculateLikeDislike } from 'src/core/utils/calculate-like-dislike.util';
import { CommentsSqlRepository } from '../../infrastructure/sql/repositories/comments-sql.repo';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase implements ICommandHandler<
  UpdateCommentLikeStatusCommand,
  void
> {
  constructor(
    private commentsRepo: CommentsSqlRepository,

    private dataSource: DataSource,
  ) {}

  async execute(command: UpdateCommentLikeStatusCommand): Promise<void> {
    const { commentId, userId, likeStatus } = command;

    await this.dataSource.transaction(async (manager) => {
      // * Первый запрос в транзакции блокирует строку комментария (FOR UPDATE), поэтому параллельный запрос ждёт до COMMIT. Гонка закрыта!
      const commentInstance = await this.commentsRepo.findByIdForUpdate(
        commentId,
        manager,
      );

      if (!commentInstance || commentInstance.isBanned)
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: `This comment with ID:${commentId} was not found`,
          extensions: [],
        });

      // * Чтение статуса, upsert и обновление счётчика идут через manager, то есть в одном соединении и одной транзакции. Получается «всё или ничего».
      const prevLikeStatus = await this.commentsRepo.findUserCurrentLikeStatus(
        userId,
        commentId,
        manager,
      );
      const nextLikeStatus = likeStatus;

      if (prevLikeStatus === nextLikeStatus) return;

      const { likes, disLikes } = calculateLikeDislike(
        prevLikeStatus ?? LikeStatus.None,
        nextLikeStatus,
      );

      return this.commentsRepo.setLikeStatusForComment(
        commentId,
        userId,
        likeStatus,
        likes,
        disLikes,
        manager,
      );
    });
  }
}
