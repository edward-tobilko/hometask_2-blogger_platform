import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { SecurityDevicesSqlRepository } from 'src/modules/user-accounts/infrastructure/sql/repositories/security-devices-sql.repository';

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
  constructor(private securityDevicesRepo: SecurityDevicesSqlRepository) {}

  async execute({
    deviceId,
    currentUserId,
  }: DeleteSecurityDeviceByIdCommand): Promise<void> {
    const existingSession = await this.securityDevicesRepo.findById(deviceId);

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

    await this.securityDevicesRepo.removeById(deviceId);
  }
}
