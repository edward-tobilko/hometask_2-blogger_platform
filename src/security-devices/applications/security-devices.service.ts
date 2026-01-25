import { ForbiddenError, NotFoundError } from "@core/errors/application.error";
import { ApplicationResult } from "@core/result/application.result";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { SessionQueryRepo } from "auth/repositories/session-query.repo";
import { SecurityDevicesRepo } from "security-devices/repositories/security-devices.repo";

class SecurityDevicesQueryService {
  constructor(
    private securityDevicesRepo: SecurityDevicesRepo,
    private sessionQueryRepo: SessionQueryRepo
  ) {}

  async removeAllSecurityDevicesExceptCurrent(
    userId: string,
    currentDeviceId: string
  ): Promise<ApplicationResult<boolean>> {
    await this.securityDevicesRepo.removeAllSecurityDevicesExceptCurrentRepo(
      userId,
      currentDeviceId
    );

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: true,
      extensions: [],
    });
  }

  async removeSecurityDeviceById(
    deviceId: string,
    currentUserId: string
  ): Promise<ApplicationResult<boolean>> {
    const session = await this.sessionQueryRepo.findByDeviceId(deviceId);

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
      await this.securityDevicesRepo.removeSecurityDeviceByIdRepo(deviceId);

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: deletedDevice,
      extensions: [],
    });
  }
}

export const securityDevicesService = new SecurityDevicesQueryService(
  new SecurityDevicesRepo(),
  new SessionQueryRepo()
);
