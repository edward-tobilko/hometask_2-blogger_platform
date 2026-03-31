import { SessionLean } from "auth/infrastructure/schemas/auth.schema";

export interface ISessionQueryRepo {
  findBySessionId(sessionId: string): Promise<SessionLean | null>;

  findByDeviceId(
    deviceId: string,
    userId?: string
  ): Promise<SessionLean | null>;
}
