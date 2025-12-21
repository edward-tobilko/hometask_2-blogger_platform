import jwt, { Secret, SignOptions } from "jsonwebtoken";

import { appConfig } from "../../core/settings/config";

const JWT_SECRET: Secret = appConfig.AC_SECRET; // type Secret - проверяет, чтобы не было JWT_SECRET = null

const AC_TIME: SignOptions["expiresIn"] = (appConfig.AC_TIME ??
  "1h") as SignOptions["expiresIn"]; // SignOptions["expiresIn"] - что бы TS не ругался

export const jwtService = {
  async createAccessToken(userId: string): Promise<string> {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: AC_TIME });
  },

  async verifyAccessToken(token: string): Promise<{ userId: string } | null> {
    try {
      return jwt.verify(token, appConfig.AC_SECRET) as { userId: string };
    } catch (error: unknown) {
      console.error("Token verify some error!");

      return null;
    }
  },

  async decodeAccessToken(token: string): Promise<any> {
    try {
      return jwt.decode(token);
    } catch (error: unknown) {
      console.error("Cannot decode this token", error);

      return null;
    }
  },
};
