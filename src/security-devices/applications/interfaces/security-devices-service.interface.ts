import { ApplicationResult } from "@core/result/application.result";

export interface ISecurityDevicesService {
  removeAllSecurityDevicesExceptCurrent(
    userId: string,
    currentDeviceId: string
  ): Promise<void>;

  removeSecurityDeviceById(
    deviceId: string,
    currentUserId: string
  ): Promise<ApplicationResult<boolean>>;
}
