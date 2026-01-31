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

// ? return response 204 - Even if current email is not registered (for prevent user's email detection).
// ? return response 400 - If the inputModel has invalid email (for example 222^gmail.com).
// ? return response 429 - More than 5 attempts from one IP-address during 10 seconds (authCustomRateLimiter middleware)
