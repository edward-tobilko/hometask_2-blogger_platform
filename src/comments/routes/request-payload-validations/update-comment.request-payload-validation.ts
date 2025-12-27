import { body } from "express-validator";

export const updateCommentDtoRPValidation = body("content")
  .isString()
  .withMessage("Content should be a string")
  .bail()
  .trim()
  .notEmpty()
  .withMessage("Content is required")
  .bail()
  .isLength({ min: 20, max: 300 })
  .withMessage("Content must be contain from 20 to 300 characters");
