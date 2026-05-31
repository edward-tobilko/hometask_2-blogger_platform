import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { SecurityDevicesRepository } from 'src/modules/user-accounts/infrastructure/repositories/security-devices.repository';

export class DeleteSecurityDeviceByIdCommand {
  deviceId: string;
  currentUserId: string;

  constructor(deviceId: string, currentUserId: string) {
    this.deviceId = deviceId;
    this.currentUserId = currentUserId;
  }
}

@CommandHandler(DeleteSecurityDeviceByIdCommand)
export class DeleteSecurityDeviceByIdUseCase implements ICommandHandler<
  DeleteSecurityDeviceByIdCommand,
  void
> {
  constructor(private securityDevicesRepo: SecurityDevicesRepository) {}

  async execute({
    deviceId,
    currentUserId,
  }: DeleteSecurityDeviceByIdCommand): Promise<void> {
    const existingSession =
      await this.securityDevicesRepo.findSecurityDeviceById(deviceId);

    if (!existingSession)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Session not found`,
      });

    if (existingSession.userId !== currentUserId)
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You are not allowed to delete this session',
      });

    await this.securityDevicesRepo.removeSecurityDeviceById(deviceId);
  }
}
