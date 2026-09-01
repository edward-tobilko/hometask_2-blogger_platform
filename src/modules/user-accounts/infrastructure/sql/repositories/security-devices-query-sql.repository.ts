import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SecurityDeviceOrmEntity } from '../schemas/security-device-orm.entity';
import { SecurityDevicesViewModel } from '../../../api/view-dto/security-devices.view-dto';

@Injectable()
export class SecurityDevicesSqlQueryRepository {
  constructor(
    @InjectRepository(SecurityDeviceOrmEntity)
    private readonly securityDevicesQueryRepo: Repository<SecurityDeviceOrmEntity>,
  ) {}

  async findByDeviceId(
    deviceId: string,
  ): Promise<SecurityDeviceOrmEntity | null> {
    const deviceInstance = await this.securityDevicesQueryRepo.findOne({
      where: {
        deviceId,
      },
    });

    return !deviceInstance ? null : deviceInstance;
  }

  async findAllByUserId(userId: string): Promise<SecurityDevicesViewModel[]> {
    const deviceInstance = await this.securityDevicesQueryRepo.find({
      where: { userId },
    });

    return SecurityDevicesViewModel.mapToViewModels(deviceInstance);
  }
}
