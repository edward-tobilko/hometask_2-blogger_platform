import { SessionLean } from "auth/infrastructure/schemas/auth.schema";
import { SessionEntity } from "../entities/session.entity";

export class SessionMapper {
  static toDomain(sessionDoc: SessionLean): SessionEntity {
    return SessionEntity.reconstitute({
      id: sessionDoc._id.toString(),
      login: sessionDoc.login,
      userId: sessionDoc.userId.toString(),
      deviceId: sessionDoc.deviceId,
      sessionId: sessionDoc.sessionId,
      ip: sessionDoc.ip,
      userDeviceName: sessionDoc.userDeviceName,
      lastActiveDate: sessionDoc.lastActiveDate,
      expiresAt: sessionDoc.expiresAt,
      createdAt: new Date(),
      refreshIat: sessionDoc.refreshIat,
    });
  }
}
