import { Router } from "express";

import { loginOrEmailAuthValidation } from "./middleware-validations/login-auth.middleware-validation";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { createLoginHandler } from "./http-handlers/create-login.handler";
import { getAuthMeHandler } from "./http-handlers/get-auth-me.handler";
import { jwtAuthGuard } from "../api/guards/jwt-auth.guard";

export const authRoute = Router();

// * GET
authRoute.get("", jwtAuthGuard, getAuthMeHandler);

// * POST
authRoute.post(
  "",
  loginOrEmailAuthValidation,
  inputResultMiddlewareValidation,
  createLoginHandler
);
