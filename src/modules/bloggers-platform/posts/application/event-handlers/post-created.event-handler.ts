import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { PostCreatedEvent } from '../../domain/events/post-created.event';
import { BlogSubscriptionsRepository } from 'src/modules/bloggers-platform/blogs/infrastructure/mongo/repositories/blog-subscriptions.repository';
import { TelegramAdapter } from 'src/core/adapters/telegram.adapter';
import { UsersSqlExternalRepository } from 'src/modules/user-accounts/infrastructure/sql/repositories/users-sql-external.repository';

@EventsHandler(PostCreatedEvent)
export class PostCreatedEventHandler implements IEventHandler<PostCreatedEvent> {
  constructor(
    private readonly blogSubscriptionsRepo: BlogSubscriptionsRepository,
    private readonly usersExternalRepo: UsersSqlExternalRepository,
    private readonly telegramAdapter: TelegramAdapter,
  ) {}

  async handle(event: PostCreatedEvent): Promise<void> {
    const { blogId, blogName, postTitle } = event;

    const userSubscriberIds =
      await this.blogSubscriptionsRepo.findSubscribersByBlogId(blogId); // получаем массив userIds всех подписчиков этого блога

    const users = await this.usersExternalRepo.findByIds(userSubscriberIds); // передаём весь массив ID сразу, получаем всех пользователей одним запросом.

    for (const user of users) {
      if (!user.telegramChatId) continue;

      try {
        await this.telegramAdapter.sendMessage(
          user.telegramChatId,
          `New post in blog "${blogName}": ${postTitle}`,
        );
      } catch (error) {
        console.error('TELEGRAM_SEND_ERROR', error);
      }
    }
  }
}
