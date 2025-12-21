import { SETTINGS_MONGO_DB } from "../../../core/settings/setting-mongo.db";
import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";

export const baseAuthGuard = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = req.headers.authorization;

  if (!auth?.startsWith("Basic ")) {
    res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    return;
  }

  try {
    const base64Credentials = auth.split(" ")[1];
    if (!base64Credentials) {
      res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      return;
    }

    const decoded = Buffer.from(base64Credentials, "base64").toString("utf-8");

    const sep = decoded.indexOf(":");
    if (sep === -1) {
      res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      return;
    }

    const username = decoded.slice(0, sep);
    const password = decoded.slice(sep + 1);

    if (
      username === SETTINGS_MONGO_DB.ADMIN_USERNAME &&
      password === SETTINGS_MONGO_DB.ADMIN_PASSWORD
    ) {
      next();

      return;
    }

    res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    return;
  } catch (error) {
    console.error("Auth decode error:", error);

    res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  }
};
