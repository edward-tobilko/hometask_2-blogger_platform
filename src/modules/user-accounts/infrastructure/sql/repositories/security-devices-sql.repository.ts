import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { SecurityDeviceOrmEntity } from '../schemas/security-device-orm.entity';
import { CreateSecurityDevicesDomainDto } from '../../../domain/dto/create-security-devices.dto';

@Injectable()
export class SecurityDevicesSqlRepository {
  constructor(
    @InjectRepository(SecurityDeviceOrmEntity)
    private readonly securityDevicesRepo: Repository<SecurityDeviceOrmEntity>,
  ) {}

  async findById(deviceId: string): Promise<SecurityDeviceOrmEntity | null> {
    if (!isUUID(deviceId)) return null; // return 404 instead 500

    const deviceInstance = await this.securityDevicesRepo.findOne({
      where: { deviceId },
    });

    return !deviceInstance ? null : deviceInstance;
  }

  async save(securityDevices: SecurityDeviceOrmEntity): Promise<void> {
    await this.securityDevicesRepo.save(securityDevices);
  }

  async create(
    dto: CreateSecurityDevicesDomainDto,
  ): Promise<SecurityDeviceOrmEntity> {
    const securityDevice = SecurityDeviceOrmEntity.create(dto);

    return this.securityDevicesRepo.save(securityDevice);
  }

  async updateSessionDates(
    deviceId: string,
    lastActiveDate: Date,
    expiresAt: Date,
  ): Promise<void> {
    await this.securityDevicesRepo.update(
      { deviceId },
      { lastActiveDate, expiresAt },
    );
  }

  async removeAllExceptCurrent(
    currentUserId: string,
    currentDeviceId: string,
  ): Promise<void> {
    // * Удалить все сессии пользователя userId, в которых deviceId НЕ равен currentDeviceId
    await this.securityDevicesRepo
      .createQueryBuilder() // удалить всё кроме одного
      .delete()
      .where('user_id = :userId AND device_id != :deviceId', {
        userId: currentUserId,
        deviceId: currentDeviceId,
      })
      .execute();
  }

  async removeById(deviceId: string): Promise<void> {
    await this.securityDevicesRepo.delete({ deviceId });
  }

  async removeExpired(nowDate: Date = new Date()): Promise<number> {
    const result = await this.securityDevicesRepo.delete({
      expiresAt: LessThan(nowDate), // DELETE ... WHERE expires_at < now
    });

    return result.affected ?? 0; // сколько сессий удалено — для лога
  }

  // * Extra methods over the API logic
  async removeAllByUserId(userId: string): Promise<void> {
    await this.securityDevicesRepo.delete({ userId });
  }
}
