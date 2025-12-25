import { ApplicationError } from "./application.error";
import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../utils/http-status-codes.util";
import { createErrorMessages } from "./create-error-messages.error";

export const errorsHandler = (
  err: unknown,
  _req: Request,
  res: Response
): void => {
  if (err instanceof ApplicationError) {
    const status = err.statusCode ?? HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY_422;

    res.status(status).json(
      createErrorMessages([
        {
          field: err.field!,
          message: err.message,
          statusCode: err.statusCode,
        },
      ])
    );

    return;
  }

  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
    errorsMessages: [
      {
        field: err,
        message: "500 = internal server error from errorsHandler",
      },
    ],
  });

  return;
};
