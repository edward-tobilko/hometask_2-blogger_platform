import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";

import { HTTP_STATUS_CODES } from "../core/utils/http-statuses.util";

dotenv.config();

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export const adminGuardMiddlewareAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = req.headers["authorization"] as string;

  if (!auth) {
    return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  }

  const [authType, token] = auth.split(" ");

  if (authType !== "Basic") {
    return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  }

  const credentials = Buffer.from(token, "base64").toString("utf-8");

  const [username, password] = credentials.split(":");

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  }

  next();
};
