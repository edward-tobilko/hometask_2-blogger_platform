import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostsRepository } from '../../infrastructure/repositories/posts.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { PostsQueryRepository } from '../../infrastructure/repositories/posts-query.repository';
import { LikeStatus } from 'src/core/enums/like-status.enum';
import { calculateLikeDislike } from 'src/core/utils/calculate-like-dislike.util';

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
    private postsRepo: PostsRepository,
    private readonly postsQueryRepo: PostsQueryRepository,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand): Promise<void> {
    const { postId, userId, likeStatus } = command;

    const postInstance = await this.postsRepo.findById(postId);

    if (!postInstance)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This post with ${postId} was not found`,
      });

    // * Получаем предыдущий статус лайка
    const prevLike = await this.postsQueryRepo.findUserCurrentLikeStatus(
      userId,
      postId,
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
    );
  }
}
