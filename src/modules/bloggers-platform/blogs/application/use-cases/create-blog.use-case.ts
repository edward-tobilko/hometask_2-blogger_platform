import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateBlogDto } from '../../api/dto/input-dto/create-blog.input-dto';
import { BlogDocument } from '../../domain/entities/blog.entity';
import { BlogsRepository } from '../../infrastructure/repositories/blogs.repository';

// * Розширяем (extends) Command, что бы не типизировать .commandBus.execute в контроллере.
export class CreateBlogCommand extends Command<BlogDocument> {
  constructor(public dto: CreateBlogDto) {
    super();
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<
  CreateBlogCommand,
  BlogDocument
> {
  constructor(private blogsRepo: BlogsRepository) {}

  async execute({ dto }: CreateBlogCommand): Promise<BlogDocument> {
    return this.blogsRepo.create(dto);
  }
}
