import { SETTINGS_MONGO_DB } from "../../core/settings/setting-mongo.db";
import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../core/utils/http-status-codes.util";

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

    const decoded = Buffer.from(base64Credentials, "base64").toString("utf-8");

    const sep = decoded.indexOf(":");
    if (sep === -1) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const username = decoded.slice(0, sep);
    const password = decoded.slice(sep + 1);

    if (
      username === SETTINGS_MONGO_DB.ADMIN_USERNAME &&
      password === SETTINGS_MONGO_DB.ADMIN_PASSWORD
    ) {
      return next();
    }

    return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  } catch (error) {
    console.error("Auth decode error:", error);
    return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  }
};
