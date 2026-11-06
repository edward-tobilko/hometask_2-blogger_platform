import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/infrastructure/external-repo/users.external-query-repo';
import { CommentsSqlRepository } from 'src/modules/bloggers-platform/comments/infrastructure/sql/repositories/comments-sql.repo';
import { PostsSqlRepository } from '../../infrastructure/sql/repositories/posts-sql.repository';

export class CreateCommentCommand extends Command<{ id: string }> {
  constructor(
    public postId: string,
    public content: string,
    public userId: string,
  ) {
    super();
  }
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    private readonly postsRepo: PostsSqlRepository,
    private readonly commentsRepo: CommentsSqlRepository,
    private readonly externalUsersRepo: UsersExternalQueryRepository,
  ) {}

  async execute({
    postId,
    content,
    userId,
  }: CreateCommentCommand): Promise<{ id: string }> {
    const postInstance = await this.postsRepo.findById(postId);

    if (!postInstance)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This post with ID:${postId} was not found`,
      });

    const userView =
      await this.externalUsersRepo.getByIdOrNotFoundFailQB(userId);

    const commentInstance = await this.commentsRepo.create(
      postId,
      content,
      userView.id,
      userView.login,
    );

    return { id: commentInstance.id };
  }
}
