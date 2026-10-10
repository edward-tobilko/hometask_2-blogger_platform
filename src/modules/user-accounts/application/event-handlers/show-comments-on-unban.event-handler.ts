import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { CommentsExternalRepository } from 'src/modules/bloggers-platform/comments/infrastructure/external-repositories/comments-external.repository';
import { UserUnBannedEvent } from '../../domain/events/user-unbanned.event';

@EventsHandler(UserUnBannedEvent)
export class ShowCommentsOnUnBanEventHandler implements IEventHandler<UserUnBannedEvent> {
  constructor(private commentsExternalRepo: CommentsExternalRepository) {}

  async handle({ userId }: UserUnBannedEvent): Promise<void> {
    try {
      await this.commentsExternalRepo.showAllByUserId(userId);
    } catch (error) {
      console.error('SHOW_COMMENTS_ON_BAN_ERROR', error);
    }
  }
}
