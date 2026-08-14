import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import {
  SecurityDevices,
  SecurityDevicesLean,
  SecurityDevicesModel,
} from '../../../domain/entities/security-devices.entity';
import { SecurityDevicesViewModel } from '../../../api/view-dto/security-devices.view-dto';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    @InjectModel(SecurityDevices.name)
    private securityDevicesModel: SecurityDevicesModel,
  ) {}

  async findByDeviceId(deviceId: string): Promise<SecurityDevicesLean | null> {
    const deviceInstanceLean = await this.securityDevicesModel
      .findOne({ deviceId })
      .lean<SecurityDevicesLean>()
      .exec();

    return !deviceInstanceLean ? null : deviceInstanceLean;
  }

  async findAllSecurityDevicesByUserId(
    userId: string,
  ): Promise<SecurityDevicesViewModel[]> {
    const deviceInstanceLean = await this.securityDevicesModel
      .find({ userId })
      .lean<SecurityDevicesLean[]>()
      .exec();

    return SecurityDevicesViewModel.mapToViewModels(deviceInstanceLean);
  }
}
