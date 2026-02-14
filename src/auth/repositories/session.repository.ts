import { injectable } from "inversify";

import { ISessionRepository } from "auth/interfaces/ISessionRepository";
import { SessionDb, SessionModel } from "auth/mongoose/auth-schema.mongoose";

@injectable()
export class SessionRepository implements ISessionRepository {
  async upsertLoginSession(session: SessionDb): Promise<void> {
    await SessionModel.updateOne(
      {
        userId: session.userId,
        deviceId: session.deviceId,
      }, // key
      {
        $set: {
          sessionId: session.sessionId,
          ip: session.ip,
          userDeviceName: session.userDeviceName,
          lastActiveDate: session.lastActiveDate,
          expiresAt: session.expiresAt,

          refreshIat: session.refreshIat,
        },
        $setOnInsert: {
          // createdAt: session.createdAt, // автоматически создат нам монгус в schema -> timestamps = true

          userId: session.userId,
          login: session.login,
          deviceId: session.deviceId,
        },
      },
      { upsert: true, timestamps: true }
    );
  }

  async updateLastActiveDate(sessionId: string): Promise<boolean> {
    const result = await SessionModel.updateOne(
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
    const result = await SessionModel.updateOne(
      { sessionId },
      {
        $set: {
          refreshToken: newRefreshToken,
          expiresAt: newExpirationDate,
          lastActiveDate: new Date(),
        },
      }
    );
    return result.modifiedCount === 1;
  }

  async updateRefreshIat(
    sessionId: string,
    refreshIat: number
  ): Promise<boolean> {
    const res = await SessionModel.updateOne(
      { sessionId },
      { $set: { refreshIat } }
    );

    return res.matchedCount === 1;
  }

  async deleteBySessionId(sessionId: string): Promise<boolean> {
    const deleteRes = await SessionModel.deleteOne({ sessionId });

    return deleteRes.deletedCount === 1;
  }
}

// ? upsert = update + insert

// ? Если нужно разрешить много сессий на один deviceId — тогда делаем insertOne, а не upsert.
