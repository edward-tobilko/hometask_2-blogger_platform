import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CommentsRepository } from 'src/modules/bloggers-platform/comments/infrastructure/repositories/comments.repo';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/infrastructure/external-query/users.external-query-repo';
import { CommentDocument } from 'src/modules/bloggers-platform/comments/domain/entities/comment.entity';
import { PostsRepository } from '../../infrastructure/mongo/repositories/posts.repository';

export class CreateCommentCommand extends Command<CommentDocument> {
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
    private readonly postsRepo: PostsRepository,
    private readonly commentsRepo: CommentsRepository,
    private readonly externalUsersRepo: UsersExternalQueryRepository,
  ) {}

  async execute({
    postId,
    content,
    userId,
  }: CreateCommentCommand): Promise<CommentDocument> {
    const post = await this.postsRepo.findById(postId);

    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This post with ID:${postId} was not found`,
      });

    const user = await this.externalUsersRepo.getByIdOrNotFoundFail(userId);

    const commentInstance = await this.commentsRepo.create(
      postId,
      content,
      user.id,
      user.login,
    );

    return commentInstance;
  }
}
