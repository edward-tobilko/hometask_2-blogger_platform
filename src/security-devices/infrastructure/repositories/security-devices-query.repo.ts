import { injectable } from "inversify";
import { Types } from "mongoose";

import { SecurityDevicesListOutput } from "security-devices/applications/output/security-devices-type.output";
import { ISecurityDevicesQueryRepo } from "security-devices/applications/interfaces/security-devices-query-repo.interface";
import {
  SessionLean,
  SessionModel,
} from "auth/infrastructure/schemas/auth.schema";
import { SecurityDevicesMapper } from "security-devices/domain/mappers/security-devices.mapper";

@injectable()
export class SecurityDevicesQueryRepo implements ISecurityDevicesQueryRepo {
  async findAllSecurityDevicesByUserId(
    userId: string
  ): Promise<SecurityDevicesListOutput | null> {
    const sessionsByUserId = await SessionModel.find({
      userId: new Types.ObjectId(userId),
    })
      .lean<SessionLean[]>()
      .exec();

    if (!sessionsByUserId) return null;

    return SecurityDevicesMapper.mapSessionToSecurityDevicesListOutput(
      sessionsByUserId
    );
  }
}
