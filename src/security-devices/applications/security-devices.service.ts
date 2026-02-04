import { inject, injectable } from "inversify";

import { ForbiddenError, NotFoundError } from "@core/errors/application.error";
import { ApplicationResult } from "@core/result/application.result";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { Types } from "@core/di/types";
import { ISecurityDevicesService } from "security-devices/interfaces/ISecurityDevicesService";
import { ISecurityDevicesRepo } from "security-devices/interfaces/ISecurityDevicesRepo";
import { ISessionQueryRepo } from "auth/interfaces/ISessionQueryRepo";

@injectable()
export class SecurityDevicesService implements ISecurityDevicesService {
  constructor(
    @inject(Types.ISecurityDevicesRepo)
    private securityDevicesRepo: ISecurityDevicesRepo,
    @inject(Types.ISessionQueryRepo) private sessionQueryRepo: ISessionQueryRepo
  ) {}

  async removeAllSecurityDevicesExceptCurrent(
    userId: string,
    currentDeviceId: string
  ): Promise<ApplicationResult<boolean>> {
    await this.securityDevicesRepo.removeAllSecurityDevicesExceptCurrent(
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
      await this.securityDevicesRepo.removeSecurityDeviceById(deviceId);

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: deletedDevice,
      extensions: [],
    });
  }
}
