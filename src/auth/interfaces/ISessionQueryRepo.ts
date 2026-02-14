import { SessionLean } from "auth/mongoose/auth-schema.mongoose";

export interface ISessionQueryRepo {
  findBySessionId(sessionId: string): Promise<SessionLean | null>;

  findByDeviceId(deviceId: string): Promise<SessionLean | null>;
}
