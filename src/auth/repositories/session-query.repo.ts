import { injectable } from "inversify";

import { authSessionCollection } from "db/mongo.db";
import { SessionDB } from "db/types.db";
import { ISessionQueryRepo } from "auth/interfaces/ISessionQueryRepo";

@injectable()
export class SessionQueryRepo implements ISessionQueryRepo {
  async findBySessionId(sessionId: string): Promise<SessionDB | null> {
    return authSessionCollection.findOne({ sessionId });
  }

  async findByDeviceId(deviceId: string): Promise<SessionDB | null> {
    return authSessionCollection.findOne({ deviceId });
  }
}
