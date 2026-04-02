import { ApplicationResult } from "@core/result/application.result";
import { SecurityDevicesListOutput } from "@security-devices/applications/output/security-devices-type.output";

export interface ISecurityDevicesQueryService {
  getAllSecurityDevices(
    userId: string
  ): Promise<ApplicationResult<SecurityDevicesListOutput>>;
}
