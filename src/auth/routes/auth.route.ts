import { Router } from "express";

import { loginOrEmailAuthRPValidation } from "./request-payload-validations/login-auth.request-payload-types";
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
  loginOrEmailAuthRPValidation,
  inputResultMiddlewareValidation,
  createLoginHandler
);
