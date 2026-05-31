import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  SecurityDevices,
  SecurityDevicesDocument,
  SecurityDevicesModel,
} from '../../domain/entities/security-devices.entity';
import { CreateSecurityDevicesDomainDto } from '../../domain/dto/create-security-devices.dto';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectModel(SecurityDevices.name)
    protected securityDevicesModel: SecurityDevicesModel,
  ) {}

  async findSecurityDeviceById(
    deviceId: string,
  ): Promise<SecurityDevicesDocument | null> {
    return this.securityDevicesModel.findOne({ deviceId }).exec();
  }

  async saveSecurityDevice(
    securityDevices: SecurityDevicesDocument,
  ): Promise<void> {
    await securityDevices.save();
  }

  async create(
    dto: CreateSecurityDevicesDomainDto,
  ): Promise<SecurityDevicesDocument> {
    const securityDevices =
      this.securityDevicesModel.createSecurityDeviceInstance({
        ...dto,
      });

    await securityDevices.save();

    return securityDevices;
  }

  async updateLastActiveDate(
    deviceId: string,
    lastActiveDate: Date,
  ): Promise<void> {
    await this.securityDevicesModel
      .findOneAndUpdate({ deviceId }, { lastActiveDate })
      .exec();
  }

  async removeAllSecurityDevicesExceptCurrent(
    currentUserId: string,
    currentDeviceId: string,
  ): Promise<void> {
    // * Удалить все сессии пользователя userId, в которых deviceId НЕ равен currentDeviceId
    await this.securityDevicesModel
      .deleteMany({
        userId: currentUserId,
        deviceId: { $ne: currentDeviceId }, // $ne - "not equal" -> deviceId != currentDeviceId (найдёт только документы где deviceId строго не равен строке currentDeviceId).
      })
      .exec();
  }

  async removeSecurityDeviceById(deviceId: string): Promise<void> {
    await this.securityDevicesModel.findOneAndDelete({ deviceId }).exec();
  }
}
