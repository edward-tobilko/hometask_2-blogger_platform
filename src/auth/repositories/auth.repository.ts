import { ObjectId } from "mongodb";

import {
  authCollection,
  blackListRefreshTokensCollection,
} from "../../db/mongo.db";
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
          userDeviceTitle: authMe.userDeviceTitle,
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

  static async addTokenToBlackList(dto: {
    refreshToken: string;
    userId: ObjectId;
    deviceId: string;
    expiresAt: Date;
    reason: "rotated" | "logout" | "reuse_detected";
  }): Promise<void> {
    await blackListRefreshTokensCollection.updateOne(
      {
        token: dto.refreshToken,
      },
      {
        $setOnInsert: {
          token: dto.refreshToken,
          userId: dto.userId,
          deviceId: dto.deviceId,
          expiresAt: dto.expiresAt,
          createdAt: new Date(),
          reason: dto.reason,
        },
      },
      { upsert: true }
    );
  }

  static async isBlackListed(refreshToken: string): Promise<boolean> {
    const token = refreshToken;

    const found = await blackListRefreshTokensCollection.findOne({ token });

    return !!found;
  }
}

// ? upsert = update + insert
