import { ObjectId } from "mongodb";

import { authSessionCollection } from "db/mongo.db";
import { mapSessionToSecurityDevicesListOutput } from "security-devices/applications/mappers/map-session-to-security-devices-list.mapper";
import { SecurityDevicesListOutput } from "security-devices/applications/output/security-devices-type.output";

export class SecurityDevicesQueryRepo {
  async findAllSecurityDevicesByUserIdRepo(
    userId: string
  ): Promise<SecurityDevicesListOutput> {
    const sessionsByUserId = await authSessionCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    const securityDevicesListOutput =
      mapSessionToSecurityDevicesListOutput(sessionsByUserId);

    return securityDevicesListOutput;
  }

  async removeAllSecurityDevicesExceptCurrentRepo(
    userId: string,
    currentDeviceId: string
  ): Promise<number> {
    const deletedDevices = await authSessionCollection.deleteMany({
      userId: new ObjectId(userId),
      deviceId: { $ne: currentDeviceId },
    });

    return deletedDevices.deletedCount;
  }
}
