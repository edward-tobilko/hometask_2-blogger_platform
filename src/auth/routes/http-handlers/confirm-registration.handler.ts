import { Request, Response } from "express";
import { log } from "node:console";

import { errorsHandler } from "@core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { authService } from "auth/application/auth.service";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { mapApplicationStatusToHttpStatus } from "@core/result/map-app-status-to-http.result";
import { ApplicationError } from "@core/errors/application.error";

export const confirmRegistrationHandler = async (
  req: Request<{}, {}, { code: string }, {}>,
  res: Response
) => {
  try {
    const { code } = req.body;

    const result = await authService.confirmRegistration(code);

    if (result.status !== ApplicationResultStatus.Success) {
      return res.status(mapApplicationStatusToHttpStatus(result.status)).json(
        result.extensions.map((err: ApplicationError) => ({
          field: err.field,
          message: err.message,
          statusCode: err.statusCode,
        }))
      );
    }

    log("result ->", result);

    return res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
