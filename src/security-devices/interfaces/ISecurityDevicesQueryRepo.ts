import { SecurityDevicesListOutput } from "security-devices/applications/output/security-devices-type.output";

export interface ISecurityDevicesQueryRepo {
  findAllSecurityDevicesByUserId(
    userId: string
  ): Promise<SecurityDevicesListOutput>;
}
