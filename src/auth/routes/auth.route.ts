import { Router } from "express";

import { loginOrEmailAuthValidation } from "./middleware-validations/login-auth.middleware-validation";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { createLoginHandler } from "./http-handlers/create-login.handler";

export const authRoute = Router();

authRoute.post(
  "",
  loginOrEmailAuthValidation,
  inputResultMiddlewareValidation,
  createLoginHandler
);
