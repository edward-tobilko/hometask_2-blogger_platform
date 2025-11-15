import { NextFunction, Request, Response } from "express";

import { ApplicationError } from "./application.error";
import { HTTP_STATUS_CODES } from "../utils/http-statuses.util";
import { createErrorMessages } from "./create-error-messages.error";

export const errorsHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof ApplicationError) {
    const httpStatus_404 = HTTP_STATUS_CODES.NOT_FOUND_404;

    res.status(httpStatus_404).json(
      createErrorMessages([
        {
          status: httpStatus_404,
          detail: err.message,
        },
      ])
    );

    return;
  }

  if (err instanceof ApplicationError) {
    const httpStatus_422 = HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY_422;

    const errorBody = createErrorMessages([
      {
        status: httpStatus_422,
        detail: err.message,
        source: err.source,
        code: err.code,
      },
    ]);

    res.status(httpStatus_422).json(errorBody);

    return;
  }

  const httpStatus_500 = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500;

  res.status(httpStatus_500).json({ message: "Internal server error" });

  return;
};
