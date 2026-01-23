import { SessionDomain } from "../domain/session.domain";
import { authLoginSessionCollection } from "db/mongo.db";

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

  async updateRefreshToken(
    sessionId: string,
    newRefreshToken: string,
    newExpirationDate: Date
  ): Promise<boolean> {
    const result = await authLoginSessionCollection.updateOne(
      { sessionId },
      {
        $set: {
          refreshToken: newRefreshToken,
          expirationDate: newExpirationDate,
          lastActiveDate: new Date(),
        },
      }
    );
    return result.modifiedCount === 1;
  }

  async deleteBySessionId(sessionId: string): Promise<boolean> {
    const deleteRes = await authLoginSessionCollection.deleteOne({ sessionId });

    return deleteRes.deletedCount === 1;
  }
}

// ? upsert = update + insert

// ? Если нужно разрешить много сессий на один deviceId — тогда делаем insertOne, а не upsert.
