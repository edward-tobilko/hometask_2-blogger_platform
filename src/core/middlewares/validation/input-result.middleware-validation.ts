import { NextFunction, Request, Response } from "express";
import {
  FieldValidationError,
  ValidationError,
  validationResult,
} from "express-validator";

import { ValidationErrorType } from "../../errors/types/validation-error.type";
import { createErrorMessages } from "../../errors/create-error-messages.error";
import { HTTP_STATUS_CODES } from "../../result/types/http-status-codes.enum";

const ID_PARAMS = new Set(["id", "postId", "commentId"]);

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
  const errorsMessages = validationResult(req)
    .formatWith(formatValidationErrors)
    .array({ onlyFirstError: true }); // покажет нам первую ошибку филда, а не все сразу

  if (errorsMessages.length > 0) {
    const rawErrors = validationResult(req).array({ onlyFirstError: true });

    const hasInvalidIdParam = rawErrors.some((e: any) => {
      return e.location === "params" && ID_PARAMS.has(String(e.path));
    });

    const status = hasInvalidIdParam
      ? HTTP_STATUS_CODES.NOT_FOUND_404
      : HTTP_STATUS_CODES.BAD_REQUEST_400;

    return res.status(status).json(createErrorMessages(errorsMessages));
  }

  next(); // Если ошибок нет, передаём управление дальше
};
