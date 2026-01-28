import { Request, Response } from "express";

import { errorsHandler } from "@core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { securityDevicesQueryService } from "security-devices/applications/security-devices-query.service";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { mapApplicationStatusToHttpStatus } from "@core/result/map-app-status-to-http.result";
import { JWTService } from "auth/adapters/jwt-service.adapter";
import { sessionQueryRepo } from "auth/repositories/session-query.repo";

export async function getSecurityDevicesHandler(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const payload = await JWTService.verifyRefreshToken(refreshToken);
    if (!payload) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const { sessionId, userId, deviceId } = payload;

    const session = await sessionQueryRepo.findBySessionId(sessionId);
    if (!session) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    if (session.userId.toString() !== userId || session.deviceId !== deviceId) {
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
    }

    const result =
      await securityDevicesQueryService.getAllSecurityDevices(userId);

    if (result.status !== ApplicationResultStatus.Success) {
      return res
        .status(mapApplicationStatusToHttpStatus(result.status))
        .json({ errorsMessages: result.extensions });
    }

    res.status(HTTP_STATUS_CODES.OK_200).json(result.data);
  } catch (error: unknown) {
    console.error("ERROR FROM HANDLER:", error);

    errorsHandler(error, req, res);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
