import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsSqlRepository } from '../../infrastructure/sql/repositories/blogs-sql.repository';
import { CreateBlogDomainDto } from '../../domain/dto/create-blog.domain-dto';

export class CreateBlogCommand extends Command<{ id: string }> {
  constructor(public dto: CreateBlogDomainDto) {
    super();
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<
  CreateBlogCommand,
  { id: string }
> {
  constructor(private blogsRepo: BlogsSqlRepository) {}

  async execute({ dto }: CreateBlogCommand): Promise<{ id: string }> {
    const blogInstance = await this.blogsRepo.createByAdmin(dto);

    return { id: blogInstance.id };
  }
}
