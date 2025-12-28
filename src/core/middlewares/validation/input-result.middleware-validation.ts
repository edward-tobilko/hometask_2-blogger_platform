import { NextFunction, Request, Response } from "express";
import {
  FieldValidationError,
  ValidationError,
  validationResult,
} from "express-validator";

import { ValidationErrorType } from "../../errors/types/validation-error.type";
import { createErrorMessages } from "../../errors/create-error-messages.error";
import { HTTP_STATUS_CODES } from "../../result/types/http-status-codes.enum";

const formatValidationErrors = (
  error: ValidationError
): ValidationErrorType => {
  const expressError = error as FieldValidationError;

  return {
    field: expressError.path, // Поле с ошибкой
    message: expressError.msg, // Сообщение ошибки
  };
};

export const inputResultMiddlewareValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorsMessages = validationResult(req)
    .formatWith(formatValidationErrors)
    .array({ onlyFirstError: true }); // покажет нам первую ошибку филда, а не все сразу

  if (errorsMessages.length > 0) {
    return res
      .status(HTTP_STATUS_CODES.BAD_REQUEST_400)
      .json(createErrorMessages(errorsMessages));
  }

  next(); // Если ошибок нет, передаём управление дальше
};
