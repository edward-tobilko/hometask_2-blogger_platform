import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";

import { HTTP_STATUS_CODES } from "../core/utils/http-statuses.util";
import { envFile } from "../core/settings/setting-mongo-db";

dotenv.config({ path: envFile });

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

export const adminGuardMiddlewareAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = req.headers.authorization;

  if (!auth?.startsWith("Basic ")) {
    return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  }

  try {
    const base64Credentials = auth.split(" ")[1];
    if (!base64Credentials)
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "utf-8"
    );

    const [username, password] = credentials.split(":");

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return next();
    }

    return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  } catch (error) {
    console.error("Auth decode error:", error);
    return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  }
};
