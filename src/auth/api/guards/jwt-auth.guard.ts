import { NextFunction, Request, Response } from "express";

import { JWTService } from "../../adapters/jwt-service.adapter";
import { IdType } from "../../../core/types/id";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

export const jwtAuthGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth = req.headers["authorization"] as string;

    if (!auth) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const [authType, token] = auth.split(" ");

    if (authType !== "Bearer" || !token)
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401); // после return middleware перестает дальше работать

    const payload = await JWTService.verifyAccessToken(token);

    if (payload) {
      const { userId } = payload; // userId достаем с метода createAccessToken в который мы положили как props

      req.user = { id: userId } as IdType; // req.user adding from express.d.ts

      next();

      return;
    }
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    return;
  }
};
