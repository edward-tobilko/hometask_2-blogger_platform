import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CommentsRepository } from 'src/modules/bloggers-platform/comments/infrastructure/repositories/comments.repo';
import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comment.view-dto';
import { PostsRepository } from '../../infrastructure/repositories/posts.repository';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/infrastructure/external-query/users.external-query-repo';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public content: string,
    public userId: string,
  ) {}
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
  }: CreateCommentCommand): Promise<CommentViewModel> {
    const post = await this.postsRepo.findById(postId);

    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This post with ID:${postId} was not found`,
      });

    const user = await this.externalUsersRepo.getByIdOrNotFoundFail(userId);

    const commentDoc = await this.commentsRepo.createComment(
      postId,
      content,
      user.id,
      user.login,
    );

    return CommentViewModel.mapToViewModel(commentDoc);
  }
}
