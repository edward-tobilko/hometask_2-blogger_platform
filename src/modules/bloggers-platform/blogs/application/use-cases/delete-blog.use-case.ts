import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { BlogsSqlRepository } from '../../infrastructure/sql/repositories/blogs-sql.repository';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<
  DeleteBlogCommand,
  void
> {
  constructor(private blogsRepo: BlogsSqlRepository) {}

  async execute({ id }: DeleteBlogCommand): Promise<void> {
    const blogInstance = await this.blogsRepo.findById(id);

    if (!blogInstance)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${id} was not found`,
      });

    await this.blogsRepo.delete(id);
  }
}
