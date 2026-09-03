import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { calculateLikeDislike } from 'src/core/utils/calculate-like-dislike.util';
import { CommentsSqlRepository } from '../../infrastructure/sql/repositories/comments-sql.repo';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/infrastructure/external-query/users.external-query-repo';

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
    private readonly userAccounts: UsersExternalQueryRepository,
  ) {}

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

    const user = await this.userAccounts.getByIdOrNotFoundFail(userId);

    return this.commentsRepo.setLikeStatusForComment(
      commentId,
      userId,
      likeStatus,
      likes,
      disLikes,
      user.login,
    );
  }
}
