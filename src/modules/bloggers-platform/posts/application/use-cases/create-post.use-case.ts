import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';

import {
  Post,
  PostDocument,
  PostModel,
} from '../../domain/entities/post.entity';
import { PostsRepository } from '../../infrastructure/repositories/posts.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { BlogsExternalQueryRepository } from 'src/modules/bloggers-platform/blogs/infrastructure/external-query/blogs.external-query-repo';
import { CreatePostDomainDto } from '../../domain/dto/create-post.domain-dto';

export class CreatePostCommand {
  constructor(public dto: CreatePostDomainDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<
  CreatePostCommand,
  PostDocument
> {
  constructor(
    @InjectModel(Post.name) private postModel: PostModel,
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

    const postInstance = this.postModel.createPostInstance({
      ...dto,

      blogName: existingBlog.name, // + опциональное поле с блога
    });

    await this.postsRepo.save(postInstance);

    return postInstance;
  }
}
