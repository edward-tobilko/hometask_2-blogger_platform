import { SessionDb } from "auth/mongoose/auth-schema.mongoose";

export interface ISessionRepository {
  upsertLoginSession(session: SessionDb): Promise<void>;

  updateLastActiveDate(sessionId: string): Promise<boolean>;

  updateRefreshToken(
    sessionId: string,
    newRefreshToken: string,
    newExpirationDate: Date
  ): Promise<boolean>;

  updateRefreshIat(sessionId: string, refreshIat: number): Promise<boolean>;

  deleteBySessionId(sessionId: string): Promise<boolean>;
}
