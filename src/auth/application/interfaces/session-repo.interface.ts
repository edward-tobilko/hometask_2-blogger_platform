import { SessionEntity } from "@auth/domain/entities/session.entity";

export interface ISessionRepository {
  findBySessionId(sessionId: string): Promise<SessionEntity | null>;

  findByDeviceId(
    deviceId: string,
    userId?: string
  ): Promise<SessionEntity | null>;

  upsertLoginSession(session: SessionEntity): Promise<void>;

  updateLastActiveDate(sessionId: string): Promise<boolean>;

  updateRefreshToken(
    sessionId: string,
    newRefreshToken: string,
    newExpirationDate: Date
  ): Promise<boolean>;

  updateRefreshIat(sessionId: string, refreshIat: number): Promise<boolean>;

  deleteBySessionId(sessionId: string): Promise<boolean>;
}
