import { injectable } from "inversify";

import { ISessionQueryRepo } from "auth/interfaces/ISessionQueryRepo";
import { SessionLean, SessionModel } from "auth/mongoose/auth-schema.mongoose";

@injectable()
export class SessionQueryRepo implements ISessionQueryRepo {
  async findBySessionId(sessionId: string): Promise<SessionLean | null> {
    return SessionModel.findOne({ sessionId }).lean<SessionLean>().exec();
  }

  async findByDeviceId(deviceId: string): Promise<SessionLean | null> {
    return SessionModel.findOne({ deviceId }).lean<SessionLean>().exec();
  }
}
