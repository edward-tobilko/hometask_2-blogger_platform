import { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { errorsHandler } from "@core/errors/errors-handler.error";
import { mapApplicationStatusToHttpStatus } from "@core/result/map-app-status-to-http.result";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { DiTypes } from "@core/di/types";
import { IJWTService } from "auth/interfaces/IJWTService";
import { ISessionQueryRepo } from "auth/interfaces/ISessionQueryRepo";
import { ISecurityDevicesQueryService } from "security-devices/interfaces/ISecurityDevicesQueryService";
import { ISecurityDevicesService } from "security-devices/interfaces/ISecurityDevicesService";
import { ApplicationError } from "@core/errors/application.error";
import { createCommand } from "@core/helpers/create-command.helper";

@injectable()
export class SecurityDevicesController {
  constructor(
    @inject(DiTypes.IJWTService) private jwtService: IJWTService,
    @inject(DiTypes.ISessionQueryRepo)
    private sessionQueryRepo: ISessionQueryRepo,
    @inject(DiTypes.ISecurityDevicesQueryService)
    private securityDevicesQueryService: ISecurityDevicesQueryService,
    @inject(DiTypes.ISecurityDevicesService)
    private securityDevicesService: ISecurityDevicesService
  ) {}

  async getSecurityDevicesHandler(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken)
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      const payload = await this.jwtService.verifyRefreshToken(refreshToken);
      if (!payload) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      const { sessionId, userId, deviceId } = payload;

      const session = await this.sessionQueryRepo.findBySessionId(sessionId);
      if (!session) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      if (
        session.userId.toString() !== userId ||
        session.deviceId !== deviceId
      ) {
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
      }

      const result =
        await this.securityDevicesQueryService.getAllSecurityDevices(userId);

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

  async removeSecurityDevicesSessionsHandler(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
      }

      const payload = await this.jwtService.verifyRefreshToken(refreshToken);
      if (!payload) {
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
      }

      const { userId, deviceId } = payload;

      await this.securityDevicesService.removeAllSecurityDevicesExceptCurrent(
        userId,
        deviceId
      );

      res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      console.error("ERROR FROM HANDLER:", error);

      errorsHandler(error, req, res);
    }
  }

  async removeDeviceByIdHandler(
    req: Request<{ deviceId: string }>,
    res: Response
  ) {
    try {
      const command = createCommand<{ deviceId: string }>({
        deviceId: req.params.deviceId,
      });

      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
      }

      const payload = await this.jwtService.verifyRefreshToken(refreshToken);
      if (!payload) {
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
      }

      const result = await this.securityDevicesService.removeSecurityDeviceById(
        command.payload.deviceId,
        payload.userId
      );
      if (result.status !== ApplicationResultStatus.Success) {
        return res
          .status(mapApplicationStatusToHttpStatus(result.status))
          .json({
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
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
