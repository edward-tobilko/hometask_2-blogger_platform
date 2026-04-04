import { injectable } from "inversify";
import { Types } from "mongoose";

import { ISessionQueryRepo } from "@auth/application/interfaces/session-query-repo.interface";
import { SessionLean, SessionModel } from "db/schemas/session-db.schema";

@injectable()
export class SessionQueryRepo implements ISessionQueryRepo {
  async findByDeviceId(
    deviceId: string,
    userId?: string
  ): Promise<SessionLean | null> {
    const filter: any = { deviceId };

    if (userId) {
      filter.userId = new Types.ObjectId(userId);
    }

    return SessionModel.findOne(filter).lean<SessionLean>().exec();
  }
}
