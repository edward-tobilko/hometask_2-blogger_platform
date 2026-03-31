import { injectable } from "inversify";
import { Types } from "mongoose";

import { mapSessionToSecurityDevicesListOutput } from "security-devices/applications/mappers/map-session-to-security-devices-list.mapper";
import { SecurityDevicesListOutput } from "security-devices/applications/output/security-devices-type.output";
import { ISecurityDevicesQueryRepo } from "security-devices/interfaces/ISecurityDevicesQueryRepo";
import {
  SessionLean,
  SessionModel,
} from "auth/infrastructure/schemas/auth.schema";

@injectable()
export class SecurityDevicesQueryRepo implements ISecurityDevicesQueryRepo {
  async findAllSecurityDevicesByUserId(
    userId: string
  ): Promise<SecurityDevicesListOutput> {
    const sessionsByUserId = await SessionModel.find({
      userId: new Types.ObjectId(userId),
    })
      .lean<SessionLean[]>()
      .exec();

    const securityDevicesListOutput =
      mapSessionToSecurityDevicesListOutput(sessionsByUserId);

    return securityDevicesListOutput;
  }
}
