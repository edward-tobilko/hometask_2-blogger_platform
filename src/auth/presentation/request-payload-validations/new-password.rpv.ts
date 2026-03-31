import { body } from "express-validator";

export const newPasswordRPV = [
  body("newPassword")
    .exists()
    .withMessage("New password is required")
    .bail()
    .isString()
    .withMessage("New password must be a string")
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage("New password length should be from 6 to 20"),

  body("recoveryCode")
    .exists()
    .withMessage("Code is required")
    .bail()
    .isString()
    .withMessage("Code must be a string"),
];
