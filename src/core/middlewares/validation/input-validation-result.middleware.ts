import { NextFunction, Request, Response } from "express";
import {
  FieldValidationError,
  ValidationError,
  validationResult,
} from "express-validator";

import { HTTP_STATUS_CODES } from "../../utils/http-statuses.util";

const formatErrors = (error: ValidationError) => {
  const expressError = error as unknown as FieldValidationError;

  return {
    message: expressError.msg,
    field: expressError.path,
  };
};

export const inputValidationResultMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req)
    .formatWith(formatErrors)
    .array({ onlyFirstError: true });

  if (errors.length > 0) {
    return res
      .status(HTTP_STATUS_CODES.BAD_REQUEST_400)
      .json({ errorsMessages: errors });
  }

  next();
};
