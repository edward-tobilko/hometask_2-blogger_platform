import { Request, Response } from "express";

import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { JWTService } from "auth/adapters/jwt-service.adapter";
import { authService } from "auth/application/session.service";
import { sessionQueryRepo } from "auth/repositories/session-query.repo";

export const logoutHandler = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const payload = await JWTService.verifyRefreshToken(refreshToken);
    if (!payload) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    // * Load session from DB
    const session = await sessionQueryRepo.findBySessionId(payload.sessionId);
    if (!session) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const { userId, deviceId, iat } = payload;

    // * Rotation guard
    if (
      session.userId.toString() !== userId ||
      session.deviceId !== deviceId ||
      session.refreshIat !== iat
    ) {
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
    }

    await authService.logout(payload.sessionId);

    res.clearCookie("refreshToken");
    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
