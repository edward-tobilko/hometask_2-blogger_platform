import { NextFunction, Request, Response } from "express";

import { IdType } from "../../../core/types/id";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { IJWTService } from "auth/application/interfaces/jwt-service.interface";
import { ISessionQueryRepo } from "auth/application/interfaces/session-query-repo.interface";

export function jwtAccessAuthGuard(
  jwtService: IJWTService,
  sessionQueryRepository?: ISessionQueryRepo
) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const auth = req.headers["authorization"] as string;

      if (!auth) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      const [authType, token] = auth.split(/\s+/);

      if (authType !== "Bearer" || !token)
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401); // после return middleware перестает дальше работать

      // * closer
      const payload = await jwtService.verifyAccessToken(token);

      if (!payload?.userId || !payload.deviceId) {
        console.log("NO userId OR deviceId");

        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
      }

      const session = await sessionQueryRepository!.findByDeviceId(
        payload.deviceId,
        payload.userId
      );

      if (!session) {
        console.log("SESSION NOT FOUND");

        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
      }

      const { userId } = payload; // userId достаем с метода createAccessToken в который мы положили как props

      req.user = { id: userId } as IdType; // req.user adding from express.d.ts

      return next();
    } catch (error: unknown) {
      res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      return;
    }
  };
}

// ? jwtService — параметр внешней функции, async (req, res, next) — внутренняя функция. Внутренняя функция запоминает jwtService, даже после того, как внешняя уже отработала = замыкание.
