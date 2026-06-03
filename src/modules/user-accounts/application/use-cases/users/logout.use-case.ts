import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SecurityDevicesRepository } from 'src/modules/user-accounts/infrastructure/repositories/security-devices.repository';

export class LogoutCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand, void> {
  constructor(private securityDevicesRepo: SecurityDevicesRepository) {}

  execute({ deviceId }: LogoutCommand): Promise<void> {
    return this.securityDevicesRepo.removeSecurityDeviceById(deviceId);
  }
}
