import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostDocument } from '../../domain/entities/post.entity';
import { PostsRepository } from '../../infrastructure/repositories/posts.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { BlogsExternalQueryRepository } from 'src/modules/bloggers-platform/blogs/infrastructure/external-query/blogs.external-query-repo';
import { CreatePostDomainDto } from '../../domain/dto/create-post.domain-dto';

export class CreatePostCommand extends Command<PostDocument> {
  constructor(public dto: CreatePostDomainDto) {
    super();
  }
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<
  CreatePostCommand,
  PostDocument
> {
  constructor(
    private readonly blogsQueryRepo: BlogsExternalQueryRepository,
    private postsRepo: PostsRepository,
  ) {}

  async execute({ dto }: CreatePostCommand): Promise<PostDocument> {
    const existingBlog = await this.blogsQueryRepo.findById(dto.blogId);

    if (!existingBlog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `The blog with ID:${dto.blogId} was not found`,
      });
    }

    return this.postsRepo.create(dto, existingBlog.name);
  }
}
