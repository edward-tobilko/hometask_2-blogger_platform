export interface ISecurityDevicesRepo {
  removeAllSecurityDevicesExceptCurrent(
    userId: string,
    currentDeviceId: string
  ): Promise<number>;

  removeSecurityDeviceById(deviceId: string): Promise<boolean>;
}
