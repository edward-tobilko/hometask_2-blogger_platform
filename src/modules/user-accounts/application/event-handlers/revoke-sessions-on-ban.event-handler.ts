import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { UserBannedEvent } from '../../domain/events/user-banned.event';
import { SecurityDevicesSqlRepository } from '../../infrastructure/sql/repositories/security-devices-sql.repository';

@EventsHandler(UserBannedEvent)
export class RevokeSessionsOnBanEventHandler implements IEventHandler<UserBannedEvent> {
  constructor(private securityDevicesRepo: SecurityDevicesSqlRepository) {}

  async handle({ userId }: UserBannedEvent): Promise<void> {
    try {
      await this.securityDevicesRepo.removeAllByUserId(userId);
    } catch (error) {
      console.error('REVOKE_SESSIONS_ON_BAN_ERROR', error);
    }
  }
}
