import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { UserBannedEvent } from '../../domain/events/user-banned.event';
import { SecurityDevicesRepository } from '../../infrastructure/repositories/security-devices.repository';

@EventsHandler(UserBannedEvent)
export class RevokeSessionsOnBanEventHandler implements IEventHandler<UserBannedEvent> {
  constructor(private securityDevicesRepo: SecurityDevicesRepository) {}

  async handle({ userId }: UserBannedEvent): Promise<void> {
    await this.securityDevicesRepo.removeAllByUserId(userId);
  }
}
