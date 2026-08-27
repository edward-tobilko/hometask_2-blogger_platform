import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogSubscriptionDocument } from '../../domain/entities/blog-subscription.entity';
import { BlogSubscriptionsRepository } from '../../infrastructure/mongo/repositories/blog-subscriptions.repository';
import { BlogsRepository } from '../../infrastructure/mongo/repositories/blogs.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

// * Розширяем (extends) Command, что бы не типизировать .commandBus.execute в контроллере.
export class SubscribeToBlogCommand extends Command<BlogSubscriptionDocument> {
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
  BlogSubscriptionDocument
> {
  constructor(
    private blogSubscriptionRepo: BlogSubscriptionsRepository,
    private blogsRepo: BlogsRepository,
  ) {}

  async execute(
    command: SubscribeToBlogCommand,
  ): Promise<BlogSubscriptionDocument> {
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

    return this.blogSubscriptionRepo.createAndSave(command);
  }
}
