import { NextFunction, Request, Response } from "express";

import { IdType } from "@core/types/id";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { IJWTService } from "@auth/application/interfaces/jwt-service.interface";
import { ISessionRepository } from "@auth/application/interfaces/session-repo.interface";
import { log } from "@core/logger/logger";

export function jwtRefreshAuthGuard(
  jwtService: IJWTService,
  sessionRepo: ISessionRepository
) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies["refreshToken"] as string;

      log.info({ refreshToken }, "refreshToken from jwtRefreshAuthGuard");

      if (!refreshToken)
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      // * Замыкание!
      const payload = await jwtService.verifyRefreshToken(refreshToken);

      log.info({ payload }, "payload from jwtRefreshAuthGuard");

      if (!payload) {
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
      }

      // * Проверяем, существует ли сессия.
      const session = await sessionRepo.findBySessionId(payload.sessionId);

      if (!session) {
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
      }

      const { userId, deviceId, sessionId, iat } = payload; // достаем эти поля с метода createRefreshToken в который мы положили как props

      if (
        session.userId !== userId ||
        session.deviceId !== deviceId ||
        session.refreshIat !== iat
      ) {
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
      }

      req.user = { id: userId } as IdType; // req.user adding from express.d.ts
      req.deviceId = deviceId as string;
      req.sessionData = { deviceId, sessionId };

      next();
    } catch (error: unknown) {
      res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      return;
    }
  };
}
