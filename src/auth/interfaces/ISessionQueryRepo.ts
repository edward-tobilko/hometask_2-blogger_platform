import { SessionDB } from "db/types.db";

export interface ISessionQueryRepo {
  findBySessionId(sessionId: string): Promise<SessionDB | null>;

  findByDeviceId(deviceId: string): Promise<SessionDB | null>;
}
