import { DataSource } from 'typeorm';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { LikeStatus } from 'src/core/enums/like-status.enum';
import { calculateLikeDislike } from 'src/core/utils/calculate-like-dislike.util';
import { PostsSqlRepository } from '../../infrastructure/sql/repositories/posts-sql.repository';

export class UpdatePostLikeStatusCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase implements ICommandHandler<
  UpdatePostLikeStatusCommand,
  void
> {
  constructor(
    private postsRepo: PostsSqlRepository,
    private dataSource: DataSource,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand): Promise<void> {
    const { postId, userId, likeStatus } = command;

    await this.dataSource.transaction(async (manager) => {
      const postInstance = await this.postsRepo.findByIdForUpdate(
        postId,
        manager,
      );

      if (!postInstance)
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: `This post with ${postId} was not found`,
        });

      const prevLike = await this.postsRepo.findUserCurrentLikeStatus(
        postId,
        userId,
        manager,
      );

      const nextLike = likeStatus;

      if (prevLike === nextLike) return;

      const { likes, disLikes } = calculateLikeDislike(
        prevLike ?? LikeStatus.None,
        nextLike,
      );

      return this.postsRepo.setLikeStatusForPost(
        postId,
        userId,
        likes,
        disLikes,
        likeStatus,
        manager,
      );
    });
  }
}
