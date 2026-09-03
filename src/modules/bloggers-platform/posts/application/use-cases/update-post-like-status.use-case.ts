import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { LikeStatus } from 'src/core/enums/like-status.enum';
import { calculateLikeDislike } from 'src/core/utils/calculate-like-dislike.util';
import { PostsQuerySqlRepository } from '../../infrastructure/sql/repositories/posts-query-sql.repository';
import { PostsSqlRepository } from '../../infrastructure/sql/repositories/posts-sql.repository';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/infrastructure/external-query/users.external-query-repo';

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
    private readonly postsQueryRepo: PostsQuerySqlRepository,
    private readonly userAccountsRepo: UsersExternalQueryRepository,
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

    const userLogin = (
      await this.userAccountsRepo.getByIdOrNotFoundFail(userId)
    ).login;

    return this.postsRepo.setLikeStatusForPost(
      postId,
      userId,
      userLogin,
      likes,
      disLikes,
      likeStatus,
    );
  }
}
