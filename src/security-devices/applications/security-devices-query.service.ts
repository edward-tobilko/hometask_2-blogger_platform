import { ApplicationResult } from "@core/result/application.result";
import { SecurityDevicesQueryRepo } from "security-devices/repositories/security-devices-query.repo";
import { SecurityDevicesListOutput } from "./output/security-devices-type.output";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";

class SecurityDevicesQueryService {
  constructor(private securityDevicesQueryRepo: SecurityDevicesQueryRepo) {}

  async getAllSecurityDevices(
    userId: string
  ): Promise<ApplicationResult<SecurityDevicesListOutput>> {
    const devices =
      await this.securityDevicesQueryRepo.findAllSecurityDevicesByUserIdRepo(
        userId
      );

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: devices,
      extensions: [],
    });
  }

  async removeAllSecurityDevicesExceptCurrent(
    userId: string,
    currentDeviceId: string
  ): Promise<ApplicationResult<boolean>> {
    await this.securityDevicesQueryRepo.removeAllSecurityDevicesExceptCurrentRepo(
      userId,
      currentDeviceId
    );

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: true,
      extensions: [],
    });
  }
}

export const securityDevicesQueryService = new SecurityDevicesQueryService(
  new SecurityDevicesQueryRepo()
);
