import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SecurityDevicesSqlRepository } from 'src/modules/user-accounts/infrastructure/sql/repositories/security-devices-sql.repository';

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
  constructor(private securityDevicesRepo: SecurityDevicesSqlRepository) {}

  async execute({
    currentUserId,
    currentDeviceId,
  }: DeleteAllSecurityDevicesExceptCurrentCommand): Promise<void> {
    return this.securityDevicesRepo.removeAllExceptCurrent(
      currentUserId,
      currentDeviceId,
    );
  }
}
