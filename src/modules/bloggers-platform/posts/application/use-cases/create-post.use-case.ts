import {
  Command,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { BlogsExternalQueryRepository } from 'src/modules/bloggers-platform/blogs/infrastructure/external-query/blogs.external-query-repo';
import { CreatePostDomainDto } from '../../domain/dto/create-post.domain-dto';
import { PostCreatedEvent } from '../../domain/events/post-created.event';
import { PostOrmEntity } from '../../infrastructure/sql/schemas/post-orm.entity';
import { PostsSqlRepository } from '../../infrastructure/sql/repositories/posts-sql.repository';

export class CreatePostCommand extends Command<PostOrmEntity> {
  constructor(public dto: CreatePostDomainDto) {
    super();
  }
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<
  CreatePostCommand,
  PostOrmEntity
> {
  constructor(
    private readonly blogsQueryRepo: BlogsExternalQueryRepository,
    private postsRepo: PostsSqlRepository,

    private readonly eventBus: EventBus,
  ) {}

  async execute({ dto }: CreatePostCommand): Promise<PostOrmEntity> {
    const existingBlog = await this.blogsQueryRepo.findById(dto.blogId);

    if (!existingBlog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `The blog with ID:${dto.blogId} was not found`,
      });
    }

    const createdPost = await this.postsRepo.create(dto, existingBlog.name);

    const event = new PostCreatedEvent(
      dto.blogId,
      existingBlog.name,
      dto.title,
    ); // создаем событие

    this.eventBus.publish(event); // публикуем

    return createdPost;
  }
}
