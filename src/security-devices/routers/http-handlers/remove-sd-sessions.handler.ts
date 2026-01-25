import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { JWTService } from "auth/adapters/jwt-service.adapter";
import { errorsHandler } from "@core/errors/errors-handler.error";
import { securityDevicesService } from "security-devices/applications/security-devices.service";

export const removeSecurityDevicesSessionsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
    }

    const payload = await JWTService.verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
    }

    const { userId, deviceId } = payload;

    await securityDevicesService.removeAllSecurityDevicesExceptCurrent(
      userId,
      deviceId
    );

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    console.error("ERROR FROM HANDLER:", error);

    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
