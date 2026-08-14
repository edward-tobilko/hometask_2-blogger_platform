import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SecurityDeviceOrmEntity } from '../schemas/security-device-orm.entity';
import { CreateSecurityDevicesDomainDto } from '../../../domain/dto/create-security-devices.dto';

@Injectable()
export class SecurityDevicesSqlRepository {
  constructor(
    @InjectRepository(SecurityDeviceOrmEntity)
    private readonly securityDevicesRepo: Repository<SecurityDeviceOrmEntity>,
  ) {}

  async findById(deviceId: string): Promise<SecurityDeviceOrmEntity | null> {
    return this.securityDevicesRepo.findOne({ where: { deviceId } });
  }

  async save(securityDevices: SecurityDeviceOrmEntity): Promise<void> {
    await this.securityDevicesRepo.save(securityDevices);
  }

  async create(
    dto: CreateSecurityDevicesDomainDto,
  ): Promise<SecurityDeviceOrmEntity> {
    const securityDevice = {
      ip: dto.ip,
      title: dto.title,
      lastActiveDate: dto.lastActiveDate,
      deviceId: dto.deviceId,
      userId: dto.userId,
      expiresAt: dto.expiresAt,
    };

    return this.securityDevicesRepo.save(securityDevice);
  }

  async updateLastActiveDate(
    deviceId: string,
    lastActiveDate: Date,
  ): Promise<void> {
    await this.securityDevicesRepo.update({ deviceId }, { lastActiveDate });
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
}
