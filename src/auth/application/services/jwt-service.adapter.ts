import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { injectable } from "inversify";

import { appConfig } from "../../../core/settings/config";
import {
  IJWTAccessPayload,
  IJWTRefreshPayload,
  IJWTService,
} from "auth/application/interfaces/jwt-service.interface";
import { log } from "@core/logger/logger";

const AT_SECRET: Secret = appConfig.AT_SECRET; // type Secret - проверяет, чтобы не было AT_SECRET = null
const RT_SECRET: Secret = appConfig.RT_SECRET as unknown as Secret;

const AT_TIME: SignOptions["expiresIn"] = (appConfig.AT_TIME ??
  "20s") as SignOptions["expiresIn"]; // SignOptions["expiresIn"] - что бы TS не ругался

const RT_TIME: SignOptions["expiresIn"] = (appConfig.RT_TIME ??
  "30m") as SignOptions["expiresIn"];

@injectable()
export class JWTService implements IJWTService {
  // * Access token
  async createAccessToken(userId: string, deviceId?: string): Promise<string> {
    return jwt.sign(
      { userId, deviceId } satisfies IJWTAccessPayload,
      AT_SECRET,
      {
        expiresIn: AT_TIME,
      }
    );
  }

  async verifyAccessToken(token: string): Promise<IJWTAccessPayload | null> {
    try {
      const result = jwt.verify(token, AT_SECRET) as IJWTAccessPayload;

      return {
        userId: result.userId,
        deviceId: result.deviceId,
      };
    } catch (error: unknown) {
      console.error("Token verify some error!");

      return null;
    }
  }

  // * Refresh token
  async createRefreshToken(
    userId: string,
    deviceId: string,
    sessionId: string
  ): Promise<string> {
    return jwt.sign(
      {
        userId,
        deviceId,
        sessionId,
      } satisfies Omit<IJWTRefreshPayload, "iat">,
      RT_SECRET,
      { expiresIn: RT_TIME }
    );
  }

  async verifyRefreshToken(token: string): Promise<IJWTRefreshPayload | null> {
    try {
      const result = jwt.verify(token, RT_SECRET) as IJWTRefreshPayload;

      log.info({ result }, "result from verifyRefreshToken");

      return {
        userId: result.userId,
        deviceId: result.deviceId,
        sessionId: result.sessionId,
        iat: result.iat,
      };
    } catch (error: unknown) {
      log.error({ error }, "verifyRefreshToken failed"); // ← добавь

      return null;
    }
  }

  getExpirationDate(token: string): Date | null {
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
// ? Omit - удаляет свойство, которое нам не нужно
