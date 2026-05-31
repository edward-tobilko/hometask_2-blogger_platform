import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SecurityDevicesRepository } from 'src/modules/user-accounts/infrastructure/repositories/security-devices.repository';

export class DeleteAllSecurityDevicesExceptCurrentCommand {
  currentUserId: string;
  currentDeviceId: string;

  constructor(currentUserId: string, currentDeviceId: string) {
    this.currentUserId = currentUserId;
    this.currentDeviceId = currentDeviceId;
  }
}

@CommandHandler(DeleteAllSecurityDevicesExceptCurrentCommand)
export class DeleteAllSecurityDevicesExceptCurrentUseCase implements ICommandHandler<
  DeleteAllSecurityDevicesExceptCurrentCommand,
  void
> {
  constructor(private securityDevicesRepo: SecurityDevicesRepository) {}

  async execute({
    currentUserId,
    currentDeviceId,
  }: DeleteAllSecurityDevicesExceptCurrentCommand): Promise<void> {
    return this.securityDevicesRepo.removeAllSecurityDevicesExceptCurrent(
      currentUserId,
      currentDeviceId,
    );
  }
}
