import { NextFunction, Request, Response } from "express";

import { IdType } from "../../../core/types/id";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { IJWTService } from "auth/interfaces/IJWTService";

export function jwtAccessAuthGuard(jwtService: IJWTService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const auth = req.headers["authorization"] as string;

      if (!auth) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      const [authType, token] = auth.split(/\s+/);

      if (authType !== "Bearer" || !token)
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401); // после return middleware перестает дальше работать

      // * closer
      const payload = await jwtService.verifyAccessToken(token);

      if (!payload?.userId) {
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
      }

      const { userId } = payload; // userId достаем с метода createAccessToken в который мы положили как props

      req.user = { id: userId } as IdType; // req.user adding from express.d.ts

      return next();
    } catch (error: unknown) {
      console.log("JWT VERIFY ERROR:", error);
      console.log("AT_SECRET (len):", process.env.AT_SECRET?.length);

      res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      return;
    }
  };
}

// ? jwtService — параметр внешней функции, async (req, res, next) — внутренняя функция. Внутренняя функция запоминает jwtService, даже после того, как внешняя уже отработала = замыкание.
