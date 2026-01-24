import { authSessionCollection } from "db/mongo.db";
import { SessionDB } from "db/types.db";

export class SessionQueryRepo {
  async findBySessionId(sessionId: string): Promise<SessionDB | null> {
    return authSessionCollection.findOne({ sessionId });
  }

  async findByDeviceId(deviceId: string): Promise<SessionDB | null> {
    return authSessionCollection.findOne({ deviceId });
  }
}
