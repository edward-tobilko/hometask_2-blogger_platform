import { NextFunction, Request, Response, Router } from "express";

import { routersPaths } from "../../core/paths/paths";
import { HTTP_STATUS_CODES } from "../../core/utils/http-status-codes.util";

export const authRoute = Router();

authRoute.post(
  routersPaths.auth.login,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);

      next(error);
    }
  }
);
