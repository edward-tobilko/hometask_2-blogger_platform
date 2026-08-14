import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SecurityDevicesSqlRepository } from 'src/modules/user-accounts/infrastructure/repositories/security-devices-sql.repository';

export class LogoutCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand, void> {
  constructor(private securityDevicesRepo: SecurityDevicesSqlRepository) {}

  execute({ deviceId }: LogoutCommand): Promise<void> {
    return this.securityDevicesRepo.removeById(deviceId);
  }
}
