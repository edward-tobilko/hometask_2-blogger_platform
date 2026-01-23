import { authLoginSessionCollection } from "db/mongo.db";
import { SessionDB } from "db/types.db";

export class SessionQueryRepo {
  async findBySessionId(sessionId: string): Promise<SessionDB | null> {
    return authLoginSessionCollection.findOne({ sessionId });
  }

  async findByDeviceId(deviceId: string): Promise<SessionDB | null> {
    return authLoginSessionCollection.findOne({ deviceId });
  }
}
