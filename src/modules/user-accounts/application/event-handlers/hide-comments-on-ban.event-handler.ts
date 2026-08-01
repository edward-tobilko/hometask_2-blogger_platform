import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { UserBannedEvent } from '../../domain/events/user-banned.event';

@EventsHandler(UserBannedEvent)
export class HideCommentsOnBanEventHandler implements IEventHandler<UserBannedEvent> {
  constructor() {}

  async handle({ userId }: UserBannedEvent): Promise<void> {}
}
