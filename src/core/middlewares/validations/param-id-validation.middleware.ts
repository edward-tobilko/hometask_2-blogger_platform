import { param } from "express-validator";

export const paramIdMiddlewareValidation = param("id")
  .isString()
  .withMessage("ID must be a string")
  .trim()
  .notEmpty()
  .withMessage("ID must not be empty");
