import { body } from "express-validator";

export const loginOrEmailAuthValidation = [
  body("loginOrEmail")
    .exists()
    .withMessage("Login or Email is required")
    .bail()
    .isString()
    .withMessage("Login or Email must be a string"),

  body("password")
    .exists()
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string"),
];
