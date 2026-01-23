import { SessionDomain } from "../domain/session.domain";
import { authLoginSessionCollection } from "db/mongo.db";
import { SessionDB } from "db/types.db";

export class SessionRepository {
  async upsertLoginSession(session: SessionDomain): Promise<void> {
    await authLoginSessionCollection.updateOne(
      {
        userId: session.userId,
        login: session.login,
        deviceId: session.deviceId,
      },
      {
        $set: {
          sessionId: session.sessionId,
          ip: session.ip,
          userDeviceName: session.userDeviceName,
          lastActiveDate: session.lastActiveDate,
          expiresAt: session.expiresAt,
        },
        $setOnInsert: { createdAt: session.createdAt },
      },
      { upsert: true }
    );
  }

  async findBySessionId(sessionId: string): Promise<SessionDB | null> {
    return authLoginSessionCollection.findOne({ sessionId });
  }

  static async deleteBySessionId(sessionId: string): Promise<void> {
    await authLoginSessionCollection.deleteOne({ sessionId });
  }

  async updateLastActiveDate(sessionId: string): Promise<boolean> {
    const result = await authLoginSessionCollection.updateOne(
      { sessionId },
      {
        $set: {
          lastActiveDate: new Date(),
        },
      }
    );

    return result.matchedCount === 1;
  }
}

// ? upsert = update + insert

// ? Если нужно разрешить много сессий на один deviceId — тогда делаем insertOne, а не upsert.
