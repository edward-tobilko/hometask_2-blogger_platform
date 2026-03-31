import { SessionLean } from "auth/infrastructure/schemas/auth.schema";

export interface ISessionQueryRepo {
  findByDeviceId(
    deviceId: string,
    userId?: string
  ): Promise<SessionLean | null>;
}
