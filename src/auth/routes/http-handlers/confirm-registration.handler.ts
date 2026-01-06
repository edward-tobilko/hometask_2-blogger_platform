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

    log("CODE:", code);
    const result = await authService.confirmRegistration(code);
    log("RESULT:", result);

    if (result.status !== ApplicationResultStatus.Success) {
      return res.status(mapApplicationStatusToHttpStatus(result.status)).json({
        errorsMessages: result.extensions.map((err: ApplicationError) => ({
          message: err.message,
          field: err.field,
        })),
      });
    }

    return res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    errorsHandler(error, req, res);

    console.error("ERROR:", error);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
