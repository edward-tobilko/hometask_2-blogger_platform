import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { CommentsRepository } from '../../infrastructure/repositories/comments.repo';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { calculateLikeDislike } from 'src/core/utils/calculate-like-dislike.util';

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
  constructor(private commentsRepo: CommentsRepository) {}

  async execute(command: UpdateCommentLikeStatusCommand): Promise<void> {
    const { commentId, userId, likeStatus } = command;

    const commentInstance = await this.commentsRepo.findById(commentId);

    if (!commentInstance)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This comment with ID:${commentId} was not found`,
        extensions: [],
      });

    const prevLikeStatus = await this.commentsRepo.findUserCurrentLikeStatus(
      userId,
      commentId,
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
    );
  }
}
