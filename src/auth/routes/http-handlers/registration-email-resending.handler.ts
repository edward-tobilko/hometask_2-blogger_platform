import { Request, Response } from "express";

import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { mapApplicationStatusToHttpStatus } from "@core/result/map-app-status-to-http.result";
import { ApplicationError } from "@core/errors/application.error";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { errorsHandler } from "@core/errors/errors-handler.error";
import { authService } from "auth/application/auth.service";

export async function registrationEmailResending(
  req: Request<{}, {}, { email: string }>,
  res: Response
) {
  try {
    const { email } = req.body;

    const result = await authService.resendRegistrationEmail(email);

    if (result.status !== ApplicationResultStatus.Success) {
      return res.status(mapApplicationStatusToHttpStatus(result.status)).json({
        errorsMessages: result.extensions.map((err: ApplicationError) => ({
          field: err.field,
          message: err.message,
        })),
      });
    }

    return res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
