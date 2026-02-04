import { ObjectId } from "mongodb";
import { injectable } from "inversify";

import { authSessionCollection } from "db/mongo.db";
import { mapSessionToSecurityDevicesListOutput } from "security-devices/applications/mappers/map-session-to-security-devices-list.mapper";
import { SecurityDevicesListOutput } from "security-devices/applications/output/security-devices-type.output";
import { ISecurityDevicesQueryRepo } from "security-devices/interfaces/ISecurityDevicesQueryRepo";

@injectable()
export class SecurityDevicesQueryRepo implements ISecurityDevicesQueryRepo {
  async findAllSecurityDevicesByUserId(
    userId: string
  ): Promise<SecurityDevicesListOutput> {
    const sessionsByUserId = await authSessionCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    const securityDevicesListOutput =
      mapSessionToSecurityDevicesListOutput(sessionsByUserId);

    return securityDevicesListOutput;
  }
}
