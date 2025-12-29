import jwt, { Secret, SignOptions } from "jsonwebtoken";

import { appConfig } from "../../core/settings/config";

const JWT_SECRET: Secret = appConfig.AC_SECRET; // type Secret - проверяет, чтобы не было JWT_SECRET = null
const AC_TIME: SignOptions["expiresIn"] = (appConfig.AC_TIME ??
  "10d") as SignOptions["expiresIn"]; // SignOptions["expiresIn"] - что бы TS не ругался

type JWTPayload = {
  userId: string;
};

export class JWTService {
  static async createAccessToken(userId: string): Promise<string> {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: AC_TIME });
  }

  static async verifyAccessToken(token: string): Promise<JWTPayload | null> {
    try {
      const result = jwt.verify(token, JWT_SECRET) as JWTPayload;

      return {
        userId: result.userId,
      };
    } catch (error: unknown) {
      console.error("Token verify some error!");

      return null;
    }
  }

  static async decodeAccessToken(token: string): Promise<any> {
    try {
      return jwt.decode(token);
    } catch (error: unknown) {
      console.error("Cannot decode this token", error);

      return null;
    }
  }
}

// ? static - методы не существуют на экземпляре, только на самом классе.
