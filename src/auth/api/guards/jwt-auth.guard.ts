import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { jwtService } from "../../adapters/jwt-service.adapter";
import { IdType } from "../../../core/types/id";

export const jwtAuthGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = req.headers.authorization;

  if (!auth) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

  const [authType, token] = auth.split(" ");

  if (authType !== "Bearer" || !token)
    return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401); // после return middleware перестает дальше работать

  const payload = await jwtService.verifyAccessToken(token);

  if (payload) {
    const { userId } = payload; // userId достаем с метода createAccessToken в который мы положили как props

    req.user = { id: userId } as IdType;

    next();

    return;
  }

  res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

  return;
};
