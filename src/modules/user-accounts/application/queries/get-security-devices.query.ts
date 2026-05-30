import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SecurityDevicesViewModel } from '../../api/view-dto/security-devices.view-dto';
import { SecurityDevicesQueryRepository } from '../../infrastructure/repositories/security-devices-query.repository';

export class SecurityDevicesQuery {
  constructor(public userId: string) {}
}

@QueryHandler(SecurityDevicesQuery)
export class SecurityDevicesHandler implements IQueryHandler<
  SecurityDevicesQuery,
  SecurityDevicesViewModel[]
> {
  constructor(
    private securityDevicesQueryRepo: SecurityDevicesQueryRepository,
  ) {}

  async execute({
    userId,
  }: SecurityDevicesQuery): Promise<SecurityDevicesViewModel[]> {
    return this.securityDevicesQueryRepo.findAllSecurityDevicesByUserId(userId);
  }
}
