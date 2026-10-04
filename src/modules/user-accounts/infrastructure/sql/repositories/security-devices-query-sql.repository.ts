import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { SecurityDeviceOrmEntity } from '../schemas/security-device-orm.entity';
import { SecurityDevicesViewModel } from '../../../api/view-dto/security-devices.view-dto';

@Injectable()
export class SecurityDevicesSqlQueryRepository {
  constructor(
    @InjectRepository(SecurityDeviceOrmEntity)
    private readonly securityDevicesQueryRepo: Repository<SecurityDeviceOrmEntity>,
  ) {}

  async findAllByUserId(userId: string): Promise<SecurityDevicesViewModel[]> {
    const deviceInstance = await this.securityDevicesQueryRepo.find({
      where: {
        userId,
        expiresAt: MoreThan(new Date()), // тоже что и expires_at > $2 (текущее время) in SQL
      },
    });

    return SecurityDevicesViewModel.mapToViewModels(deviceInstance);
  }
}
