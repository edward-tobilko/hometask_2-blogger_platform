import jwt, { Secret, SignOptions } from "jsonwebtoken";

import { appConfig } from "../../core/settings/config";

const AT_SECRET: Secret = appConfig.AT_SECRET; // type Secret - проверяет, чтобы не было AT_SECRET = null
const RT_SECRET: Secret = appConfig.RT_SECRET as unknown as Secret;

const AT_TIME: SignOptions["expiresIn"] = (appConfig.AT_TIME ??
  "20s") as SignOptions["expiresIn"]; // SignOptions["expiresIn"] - что бы TS не ругался

const RT_TIME: SignOptions["expiresIn"] = (appConfig.RT_TIME ??
  "30m") as SignOptions["expiresIn"];

type JWTAccessPayload = {
  userId: string;
};

type JWTRefreshPayload = {
  userId: string;
  deviceId: string;
  sessionId: string;
};
export class JWTService {
  // * Access token
  static async createAccessToken(userId: string): Promise<string> {
    return jwt.sign({ userId } satisfies JWTAccessPayload, AT_SECRET, {
      expiresIn: AT_TIME,
    });
  }

  static async verifyAccessToken(
    token: string
  ): Promise<JWTAccessPayload | null> {
    try {
      const result = jwt.verify(token, AT_SECRET) as JWTAccessPayload;

      return {
        userId: result.userId,
      };
    } catch (error: unknown) {
      // console.error("Token verify some error!");

      return null;
    }
  }

  // * Refresh token
  static async createRefreshToken(
    userId: string,
    deviceId: string,
    sessionId: string
  ): Promise<string> {
    return jwt.sign(
      {
        userId,
        deviceId,
        sessionId,
      } satisfies JWTRefreshPayload,
      RT_SECRET,
      { expiresIn: RT_TIME }
    );
  }

  static async verifyRefreshToken(
    token: string
  ): Promise<JWTRefreshPayload | null> {
    try {
      const result = jwt.verify(token, RT_SECRET) as JWTRefreshPayload;

      return {
        userId: result.userId,
        deviceId: result.deviceId,
        sessionId: result.sessionId,
      };
    } catch (error: unknown) {
      return null;
    }
  }

  static getExpirationDate(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as { exp?: number };

      if (!decoded.exp) return null;

      return new Date(decoded.exp * 1000);
    } catch (error: unknown) {
      console.error("Cannot decode this token", error);

      return null;
    }
  }
}

// ? static - методы не существуют на экземпляре, только на самом классе.

// ? Зачем нужен deviceId ? В HW обычно нужно привязать refresh к сессии / девайсу (чтобы можно было делать logout / blacklist / multi-devices).

// ? as — это проверка: «Поверь мне, я знаю, что делаю».
// ? satisfies — это проверка: «Проверь, что это соответствует типу».
