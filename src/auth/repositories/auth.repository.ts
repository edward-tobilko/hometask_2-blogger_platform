import { ObjectId } from "mongodb";

import { authCollection } from "../../db/mongo.db";
import { SessionDomain } from "../domain/session.domain";
import { AuthDB } from "db/types.db";

export class AuthRepository {
  async saveAuthMe(authMe: SessionDomain): Promise<void> {
    await authCollection.updateOne(
      {
        userId: authMe.userId,
        deviceId: authMe.deviceId,
      },
      {
        $set: {
          lastActiveDate: new Date(),
          userDeviceTitle: authMe.userDeviceName,
        },
      },
      { upsert: true }
    );
  }

  async upsertSession(session: SessionDomain): Promise<void> {
    await authCollection.updateOne(
      { userId: session.userId, deviceId: session.deviceId },
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

  static async findSession(
    userId: ObjectId,
    deviceId: string
  ): Promise<AuthDB | null> {
    return authCollection.findOne({ userId, deviceId });
  }

  static async deleteAuthMe(userId: ObjectId, deviceId: string): Promise<void> {
    await authCollection.deleteOne({ userId, deviceId });
  }
}

// ? upsert = update + insert

// ? Если нужно разрешить много сессий на один deviceId — тогда делаем insertOne, а не upsert.
