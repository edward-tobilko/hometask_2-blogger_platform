import { NextFunction, Request, Response } from "express";
import {
  FieldValidationError,
  ValidationError,
  validationResult,
} from "express-validator";

import { ValidationErrorType } from "../../errors/types/validation-error.type";
import { HTTP_STATUS_CODES } from "../../utils/http-status-codes.util";
import { createErrorMessages } from "../../errors/create-error-messages.error";

const formatValidationErrors = (
  error: ValidationError
): ValidationErrorType => {
  const expressError = error as FieldValidationError;

  return {
    message: expressError.msg, // Сообщение ошибки
    field: expressError.path, // Поле с ошибкой
  };
};

export const inputResultMiddlewareValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("REQ:", req.method, req.originalUrl);

  const errorsMessages = validationResult(req)
    .formatWith(formatValidationErrors)
    .array({ onlyFirstError: true }); // покажет нам первую ошибку филда, а не все сразу

  if (errorsMessages.length > 0) {
    console.log("VALIDATION ERRORS:", errorsMessages);

    return res
      .status(HTTP_STATUS_CODES.BAD_REQUEST_400)
      .json(createErrorMessages(errorsMessages));
  }

  next(); // Если ошибок нет, передаём управление дальше
};
