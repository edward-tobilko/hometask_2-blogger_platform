import { param } from "express-validator";

export const paramIdMiddlewareValidation = param("id")
  .exists()
  .withMessage("ID is required")
  .isString()
  .withMessage("ID must be a string")
  .trim()
  .notEmpty()
  .withMessage("ID must not be empty")
  .isMongoId()
  .withMessage("Incorrect format of ObjectId");
