import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostsRepository } from '../../infrastructure/repositories/posts.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

export class DeletePostByIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeletePostByIdCommand)
export class DeletePostByIdUseCase implements ICommandHandler<
  DeletePostByIdCommand,
  void
> {
  constructor(private postsRepo: PostsRepository) {}

  async execute({ id }: DeletePostByIdCommand): Promise<void> {
    const postDoc = await this.postsRepo.findById(id);

    if (!postDoc) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `The post with ID:${id} was not found`,
      });
    }

    return this.postsRepo.delete(id);
  }
}
