import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogSubscriptionsRepository } from '../../infrastructure/repositories/blog-subscriptions.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { BlogsRepository } from '../../infrastructure/repositories/blogs.repository';

export class UnsubscribeFromBlogCommand {
  constructor(
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(UnsubscribeFromBlogCommand)
export class UnsubscribeFromBlogUseCase implements ICommandHandler<
  UnsubscribeFromBlogCommand,
  void
> {
  constructor(
    private blogSubscriptionRepo: BlogSubscriptionsRepository,
    private blogsRepo: BlogsRepository,
  ) {}

  async execute({ blogId, userId }: UnsubscribeFromBlogCommand): Promise<void> {
    const existingBlog = await this.blogsRepo.findById(blogId);

    if (!existingBlog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${blogId} was not found`,
      });
    }

    const existingSubscription =
      await this.blogSubscriptionRepo.existsByUserAndBlog(userId, blogId);

    if (!existingSubscription) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This subscription was not found`,
      });
    }

    await this.blogSubscriptionRepo.delete(blogId, userId);
  }
}
