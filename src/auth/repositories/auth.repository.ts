import { ObjectId } from "mongodb";

import { authCollection } from "../../db/mongo.db";
import { AuthDomain } from "../domain/auth.domain";
import { AuthDB } from "db/types.db";

export class AuthRepository {
  async saveAuthMe(authMe: AuthDomain): Promise<void> {
    await authCollection.updateOne(
      {
        userId: authMe.userId,
        deviceId: authMe.deviceId,
      },
      {
        $set: {
          email: authMe.email,
          login: authMe.login,
          refreshToken: authMe.refreshToken,
          lastActiveDate: new Date(),
        },
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

  static async updateSessionRefreshToken(
    userId: ObjectId,
    deviceId: string,
    dto: { refreshToken: string; lastActiveDate: Date }
  ) {
    await authCollection.updateOne(
      { userId, deviceId },
      {
        $set: {
          refreshToken: dto.refreshToken,
          lastActiveDate: dto.lastActiveDate,
        },
      }
    );
  }

  static async deleteAuthMe(userId: ObjectId, deviceId: string): Promise<void> {
    await authCollection.deleteOne({ userId, deviceId });
  }
}

// ? upsert = update + insert
