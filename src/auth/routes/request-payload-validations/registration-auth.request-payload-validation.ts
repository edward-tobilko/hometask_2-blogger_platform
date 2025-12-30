import { body } from "express-validator";

import { UsersQueryRepository } from "users/repositories/users-query.repository";
import { ValidationError } from "@core/errors/application.error";

const userQueryRepo = new UsersQueryRepository();

export const registrationAuthRPValidation = [
  body("login")
    .exists()
    .withMessage("Login is required")
    .bail()
    .isString()
    .withMessage("Login must be a string")
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage("Login length should be from 3 to 10")
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage("Login must contain only letters, numbers, _ or -")
    .custom(async (login: string) => {
      const userByLogin = await userQueryRepo.findByLoginOrEmailQueryRepo(
        login,
        undefined
      );

      if (userByLogin) {
        throw new ValidationError("login", "Login already is exist", 400);
      }

      return true;
    }),

  body("password")
    .exists()
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string")
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage("Password length should be from 6 to 20"),

  body("email")
    .exists()
    .withMessage("Email is required")
    .bail()
    .isString()
    .withMessage("Email must be a string")
    .trim()
    .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
    .withMessage("Email must be a valid email")
    .custom(async (email: string) => {
      const userByEmail = await userQueryRepo.findByLoginOrEmailQueryRepo(
        undefined,
        email
      );

      if (userByEmail) {
        throw new ValidationError("email", "Email already is exist", 400);
      }

      return true;
    }),
];
