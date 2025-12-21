import { Router } from "express";

import { loginOrEmailAuthValidation } from "./middleware-validations/login-auth.middleware-validation";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { createLoginHandler } from "./http-handlers/create-login.handler";
import { getAuthMe } from "./http-handlers/get-auth-me.handler";

export const authRoute = Router();

// * GET
authRoute.get("", getAuthMe);

// * POST
authRoute.post(
  "",
  loginOrEmailAuthValidation,
  inputResultMiddlewareValidation,
  createLoginHandler
);
