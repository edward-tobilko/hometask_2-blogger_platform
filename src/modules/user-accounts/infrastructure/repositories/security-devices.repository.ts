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
}
