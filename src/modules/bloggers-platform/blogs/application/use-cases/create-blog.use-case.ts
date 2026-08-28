import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsSqlRepository } from '../../infrastructure/sql/repositories/blogs-sql.repository';
import { CreateBlogDomainDto } from '../../domain/dto/create-blog.domain-dto';
import { BlogOrmEntity } from '../../infrastructure/sql/schemas/blog-orm.entity';

// * Розширяем (extends) Command, что бы не типизировать .commandBus.execute в контроллере.
export class CreateBlogCommand extends Command<BlogOrmEntity> {
  constructor(public dto: CreateBlogDomainDto) {
    super();
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<
  CreateBlogCommand,
  BlogOrmEntity
> {
  constructor(private blogsRepo: BlogsSqlRepository) {}

  async execute({ dto }: CreateBlogCommand): Promise<BlogOrmEntity> {
    return this.blogsRepo.createByAdmin(dto);
  }
}
