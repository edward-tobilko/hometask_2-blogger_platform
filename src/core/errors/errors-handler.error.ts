import { ApplicationError } from "./application.error";
import { Request, Response } from "express";

import { createErrorMessages } from "./create-error-messages.error";
import { HTTP_STATUS_CODES } from "../result/types/http-status-codes.enum";

export const errorsHandler = (
  err: unknown,
  req: Request,
  res: Response
): void | Response => {
  const requestId = (req as any).requestId;

  console.error("[ERROR]", {
    requestId,
    path: req.originalUrl,
    method: req.method,
    err:
      err instanceof Error ? { message: err.message, stack: err.stack } : err,
  });

  if (err instanceof ApplicationError) {
    const status = err.statusCode ?? HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY_422;

    res.status(status).json(
      createErrorMessages([
        {
          message: err.message,
          field: err.field ?? "server",
          statusCode: status,
        },
      ])
    );

    return;
  }

  // * Если бросить ApplicationResult
  if (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "extensions" in err
  ) {
    const anyErr = err as any;

    return res.status(HTTP_STATUS_CODES.BAD_REQUEST_400).json(
      createErrorMessages(
        (anyErr.extensions ?? []).map((e: any) => ({
          message: e.message ?? "Error",
          field: e.field ?? "server",
          statusCode: e.statusCode ?? 400,
        }))
      )
    );
  }

  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
    errorsMessages: [
      {
        message: "Internal server error from errorsHandler",
        field: "server",
        status: 500,
      },
    ],
  });

  return;
};
