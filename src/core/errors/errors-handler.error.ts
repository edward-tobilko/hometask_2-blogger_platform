import { ApplicationError } from "./application.error";
import { Request, Response } from "express";

import { createErrorMessages } from "./create-error-messages.error";
import { HTTP_STATUS_CODES } from "../result/types/http-status-codes.enum";

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
          message: err.message,
          field: err.field!,
          statusCode: err.statusCode,
        },
      ])
    );

    return;
  }

  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
    errorsMessages: [
      {
        message: "500 = internal server error from errorsHandler",
        field: err,
      },
    ],
  });

  return;
};
