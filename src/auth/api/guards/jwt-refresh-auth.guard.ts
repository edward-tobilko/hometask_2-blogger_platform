import { NextFunction, Request, Response } from "express";

import { JWTService } from "../../adapters/jwt-service.adapter";
import { IdType } from "../../../core/types/id";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { SessionQueryRepo } from "auth/repositories/session-query.repo";

export const jwtAccessAuthGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.headers["refreshToken"] as string;
    if (!refreshToken)
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const payload = await JWTService.verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
    }

    // * Проверяем, существует ли сессия.
    const session = await SessionQueryRepo.findBySessionId(payload.sessionId);
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
