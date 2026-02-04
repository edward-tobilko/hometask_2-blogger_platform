import { SessionDomain } from "auth/domain/session.domain";

export interface ISessionRepository {
  upsertLoginSession(session: SessionDomain): Promise<void>;

  updateLastActiveDate(sessionId: string): Promise<boolean>;

  updateRefreshToken(
    sessionId: string,
    newRefreshToken: string,
    newExpirationDate: Date
  ): Promise<boolean>;

  updateRefreshIat(sessionId: string, refreshIat: number): Promise<boolean>;

  deleteBySessionId(sessionId: string): Promise<boolean>;
}
