import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { PostsSqlRepository } from '../../infrastructure/sql/repositories/posts-sql.repository';

export class DeletePostByIdCommand {
  constructor(
    public postId: string,
    public blogId?: string,
  ) {}
}

@CommandHandler(DeletePostByIdCommand)
export class DeletePostByIdUseCase implements ICommandHandler<
  DeletePostByIdCommand,
  void
> {
  constructor(private postsRepo: PostsSqlRepository) {}

  async execute({ blogId, postId }: DeletePostByIdCommand): Promise<void> {
    const post = await this.postsRepo.findById(postId);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `The post with ID:${postId} was not found`,
      });
    }

    if (blogId && post.blogId !== blogId) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This post ${post.id} does not exist in this blog ${blogId}!`,
      });
    }

    await this.postsRepo.delete(postId);
  }
}
