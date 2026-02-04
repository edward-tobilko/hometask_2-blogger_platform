import { NextFunction, Request, Response } from "express";

import { IdType } from "../../../core/types/id";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { IJWTService } from "auth/interfaces/IJWTService";
import { ISessionQueryRepo } from "auth/interfaces/ISessionQueryRepo";

export function jwtRefreshAuthGuard(
  jwtService: IJWTService,
  sessionQueryRepo: ISessionQueryRepo
) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.headers["refreshToken"] as string;
      if (!refreshToken)
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      // * Замыкание!
      const payload = await jwtService.verifyRefreshToken(refreshToken);
      if (!payload) {
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
      }

      // * Проверяем, существует ли сессия.
      const session = await sessionQueryRepo.findBySessionId(payload.sessionId);
      if (!session) {
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
      }

      const { userId, deviceId, sessionId } = payload; // достаем эти поля с метода createRefreshToken в который мы положили как props

      req.user = { id: userId } as IdType; // req.user adding from express.d.ts
      req.deviceId = deviceId as string;
      req.sessionId = sessionId as string;

      return next();
    } catch (error: unknown) {
      res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      return;
    }
  };
}
