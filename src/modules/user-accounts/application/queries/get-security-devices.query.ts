import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SecurityDevicesViewModel } from '../../api/view-dto/security-devices.view-dto';
import { SecurityDevicesSqlQueryRepository } from '../../infrastructure/sql/repositories/security-devices-query-sql.repository';

export class SecurityDevicesQuery {
  constructor(public userId: string) {}
}

@QueryHandler(SecurityDevicesQuery)
export class SecurityDevicesHandler implements IQueryHandler<
  SecurityDevicesQuery,
  SecurityDevicesViewModel[]
> {
  constructor(
    private securityDevicesQueryRepo: SecurityDevicesSqlQueryRepository,
  ) {}

  async execute({
    userId,
  }: SecurityDevicesQuery): Promise<SecurityDevicesViewModel[]> {
    return this.securityDevicesQueryRepo.findAllByUserId(userId);
  }
}
