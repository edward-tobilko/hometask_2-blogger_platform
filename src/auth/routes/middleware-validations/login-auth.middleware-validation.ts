import { body } from "express-validator";

export const loginOrEmailAuthValidation = [
  body("loginOrEmail")
    .isString()
    .withMessage("loginOrEmail must be a string")
    .trim()
    .notEmpty()
    .withMessage("loginOrEmail must not be empty")
    .isLength({ min: 3, max: 500 })
    .withMessage("Login or Email must be from 3 to 500 characters"),

  body("password")
    .isString()
    .withMessage("password must be a string")
    .trim()
    .notEmpty()
    .withMessage("password must not be empty")
    .isLength({ min: 6, max: 20 })
    .withMessage("Password length should be from 6 to 20"),
];
