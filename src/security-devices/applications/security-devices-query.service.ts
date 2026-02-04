import { inject, injectable } from "inversify";

import { ApplicationResult } from "@core/result/application.result";
import { SecurityDevicesListOutput } from "./output/security-devices-type.output";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { ISecurityDevicesQueryService } from "security-devices/interfaces/ISecurityDevicesQueryService";
import { Types } from "@core/di/types";
import { ISecurityDevicesQueryRepo } from "security-devices/interfaces/ISecurityDevicesQueryRepo";

@injectable()
export class SecurityDevicesQueryService
  implements ISecurityDevicesQueryService
{
  constructor(
    @inject(Types.ISecurityDevicesQueryRepo)
    private securityDevicesQueryRepo: ISecurityDevicesQueryRepo
  ) {}

  async getAllSecurityDevices(
    userId: string
  ): Promise<ApplicationResult<SecurityDevicesListOutput>> {
    const devices =
      await this.securityDevicesQueryRepo.findAllSecurityDevicesByUserId(
        userId
      );

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: devices,
      extensions: [],
    });
  }
}
