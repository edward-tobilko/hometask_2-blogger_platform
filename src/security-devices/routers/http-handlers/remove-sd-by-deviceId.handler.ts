import { Request, Response } from "express";

import { createCommand } from "@core/helpers/create-command.helper";
import { errorsHandler } from "@core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { JWTService } from "auth/adapters/jwt-service.adapter";
import { securityDevicesService } from "security-devices/applications/security-devices.service";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { mapApplicationStatusToHttpStatus } from "@core/result/map-app-status-to-http.result";
import { ApplicationError } from "@core/errors/application.error";

export const removeDeviceByIdHandler = async (
  req: Request<{ deviceId: string }>,
  res: Response
) => {
  try {
    const command = createCommand<{ deviceId: string }>({
      deviceId: req.params.deviceId,
    });

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
    }

    const payload = await JWTService.verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
    }

    const result = await securityDevicesService.removeSecurityDeviceById(
      command.payload.deviceId,
      payload.userId
    );

    if (result.status !== ApplicationResultStatus.Success) {
      return res.status(mapApplicationStatusToHttpStatus(result.status)).json({
        errorsMessages: result.extensions.map((err: ApplicationError) => ({
          message: err.message,
          field: err.field,
        })),
      });
    }

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    console.error("ERROR FROM HANDLER:", error);

    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
