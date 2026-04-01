import { inject, injectable } from "inversify";

import { ForbiddenError, NotFoundError } from "@core/errors/application.error";
import { ApplicationResult } from "@core/result/application.result";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { DiTypes } from "@core/di/types";
import { ISecurityDevicesService } from "security-devices/applications/interfaces/security-devices-service.interface";
import { ISecurityDevicesRepo } from "security-devices/applications/interfaces/security-devices-repo.interface";
import { ISessionRepository } from "auth/application/interfaces/session-repo.interface";

@injectable()
export class SecurityDevicesService implements ISecurityDevicesService {
  constructor(
    @inject(DiTypes.ISecurityDevicesRepo)
    private securityDevicesRepo: ISecurityDevicesRepo,
    @inject(DiTypes.ISessionRepository)
    private sessionRepo: ISessionRepository
  ) {}

  async removeAllSecurityDevicesExceptCurrent(
    userId: string,
    currentDeviceId: string
  ): Promise<void> {
    await this.securityDevicesRepo.removeAllSecurityDevicesExceptCurrent(
      userId,
      currentDeviceId
    );
  }

  async removeSecurityDeviceById(
    deviceId: string,
    currentUserId: string
  ): Promise<ApplicationResult<boolean>> {
    const session = await this.sessionRepo.findByDeviceId(deviceId);

    if (!session) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: false,
        extensions: [new NotFoundError("Device not found", "deviceId")],
      });
    }

    // * Проверяем, принадлежит ли девайс текущему пользователю
    if (session.userId.toString() !== currentUserId) {
      return new ApplicationResult({
        status: ApplicationResultStatus.Forbidden,
        data: false,
        extensions: [
          new ForbiddenError("Cannot delete other user's device", "deviceId"),
        ],
      });
    }

    const deletedDevice =
      await this.securityDevicesRepo.removeSecurityDeviceById(deviceId);

    if (!deletedDevice) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: false,
        extensions: [new NotFoundError("Device not found", "deviceId")],
      });
    }

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: deletedDevice,
      extensions: [],
    });
  }
}
