import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogSubscriptionsRepository } from '../../infrastructure/sql/repositories/blog-subscriptions.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { BlogSubscriptionsOrmEntity } from '../../infrastructure/sql/schemas/blog-subscription-orm.entity';
import { BlogsSqlRepository } from '../../infrastructure/sql/repositories/blogs-sql.repository';
import { CreateBlogSubscriptionDomainDto } from '../../domain/dto/create-blog-subscription.domain-dto';

export class SubscribeToBlogCommand extends Command<BlogSubscriptionsOrmEntity> {
  constructor(
    public userId: string,
    public blogId: string,
  ) {
    super();
  }
}

@CommandHandler(SubscribeToBlogCommand)
export class SubscribeToBlogUseCase implements ICommandHandler<
  SubscribeToBlogCommand,
  BlogSubscriptionsOrmEntity
> {
  constructor(
    private blogSubscriptionRepo: BlogSubscriptionsRepository,
    private blogsRepo: BlogsSqlRepository,
  ) {}

  async execute(
    command: SubscribeToBlogCommand,
  ): Promise<BlogSubscriptionsOrmEntity> {
    const existingBlog = await this.blogsRepo.findById(command.blogId);

    if (!existingBlog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${command.blogId} was not found`,
      });
    }

    /**
     * @throws {Error} - Для "BadRequest" специальный формат вывода extensions -> domain-exceptions.filter.ts
     */
    const existingSubscription =
      await this.blogSubscriptionRepo.existsByUserAndBlog(
        command.userId,
        command.blogId,
      );

    if (existingSubscription) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `You are already subscribed to this blog`,
        extensions: [
          { message: 'You are already subscribed to this blog', key: 'blogId' },
        ],
      });
    }

    return this.blogSubscriptionRepo.createAndSave(
      new CreateBlogSubscriptionDomainDto(command.userId, command.blogId),
    );
  }
}
