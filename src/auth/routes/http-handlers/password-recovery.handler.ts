import { errorsHandler } from "@core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { NextFunction, Request, Response } from "express";

export const passwordRecoveryHandler = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    console.error("[passwordRecoveryHandler] error:", error);

    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
