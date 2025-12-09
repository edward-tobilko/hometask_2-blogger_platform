import { body } from "express-validator";
import { UsersQueryRepository } from "../../repositories/users-query.repository";

const userQueryRepo = new UsersQueryRepository();

export const createUserDtoRequestPayloadValidations = [
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
      const user = await userQueryRepo.findByLoginOrEmailQueryRepo(login);

      if (user) {
        throw new Error("Login already is exist");
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
      const user = await userQueryRepo.findByLoginOrEmailQueryRepo(email);

      if (user) {
        throw new Error("Email already is exist");
      }

      return true;
    }),
];
