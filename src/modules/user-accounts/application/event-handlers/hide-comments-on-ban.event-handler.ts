import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { UserBannedEvent } from '../../domain/events/user-banned.event';
import { CommentsExternalRepository } from 'src/modules/bloggers-platform/comments/infrastructure/external-repositories/comments-external.repository';

@EventsHandler(UserBannedEvent)
export class HideCommentsOnBanEventHandler implements IEventHandler<UserBannedEvent> {
  constructor(private commentsExternalRepo: CommentsExternalRepository) {}

  async handle({ userId }: UserBannedEvent): Promise<void> {
    await this.commentsExternalRepo.hideAllByUserId(userId);
  }
}
