import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';

import { SecurityDevicesSqlRepository } from '../../infrastructure/sql/repositories/security-devices-sql.repository';

@Injectable()
export class AutoRemoveExpiredSessionsTask {
  constructor(private securityDevicesRepo: SecurityDevicesSqlRepository) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handle() {
    // * Как и event handler — ошибка не должна уронить приложение
    try {
      const removed = await this.securityDevicesRepo.removeExpired();

      if (removed > 0)
        console.log(`REMOVE_EXPIRED_SESSIONS: removed ${removed}`);
    } catch (error) {
      console.error('REMOVE_EXPIRED_SESSIONS_ERROR', error);
    }
  }
}
