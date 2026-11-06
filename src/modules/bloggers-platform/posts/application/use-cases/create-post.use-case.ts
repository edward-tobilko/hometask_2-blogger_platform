import {
  Command,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CreatePostDomainDto } from '../../domain/dto/create-post.domain-dto';
import { PostCreatedEvent } from '../../domain/events/post-created.event';
import { PostsSqlRepository } from '../../infrastructure/sql/repositories/posts-sql.repository';
import { BlogsSqlRepository } from 'src/modules/bloggers-platform/blogs/infrastructure/sql/repositories/blogs-sql.repository';

export class CreatePostCommand extends Command<{ id: string }> {
  constructor(public dto: CreatePostDomainDto) {
    super();
  }
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<
  CreatePostCommand,
  { id: string }
> {
  constructor(
    private blogsRepo: BlogsSqlRepository,
    private postsRepo: PostsSqlRepository,

    private readonly eventBus: EventBus,
  ) {}

  async execute({ dto }: CreatePostCommand): Promise<{ id: string }> {
    const existingBlogInstance = await this.blogsRepo.findById(dto.blogId);

    if (!existingBlogInstance) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `The blog with ID:${dto.blogId} was not found`,
      });
    }

    const createdPost = await this.postsRepo.create(dto);

    const event = new PostCreatedEvent(
      dto.blogId,
      existingBlogInstance.name,
      dto.title,
    ); // создаем событие

    this.eventBus.publish(event); // публикуем

    return { id: createdPost.id };
  }
}
