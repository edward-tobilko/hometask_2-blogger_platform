import { SessionLean } from "db/schemas/session-db.schema";

export interface ISessionQueryRepo {
  findByDeviceId(
    deviceId: string,
    userId?: string
  ): Promise<SessionLean | null>;
}
