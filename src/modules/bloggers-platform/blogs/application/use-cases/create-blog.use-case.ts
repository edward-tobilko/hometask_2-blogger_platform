import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';

import { CreateBlogDto } from '../../api/dto/input-dto/create-blog.input-dto';
import {
  Blog,
  BlogDocument,
  BlogModelType,
} from '../../domain/entities/blog.entity';
import { BlogsRepository } from '../../infrastructure/repositories/blogs.repository';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<
  CreateBlogCommand,
  BlogDocument
> {
  constructor(
    @InjectModel(Blog.name) private blogModel: BlogModelType,

    private blogsRepo: BlogsRepository,
  ) {}

  async execute({ dto }: CreateBlogCommand): Promise<BlogDocument> {
    const createdBlog = this.blogModel.createBlogInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogsRepo.save(createdBlog);

    return createdBlog;
  }
}
