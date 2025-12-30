import { Router } from "express";

import { loginOrEmailAuthRPValidation } from "./request-payload-validations/login-auth.request-payload-types";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { createLoginHandler } from "./http-handlers/create-login.handler";
import { getAuthMeHandler } from "./http-handlers/get-auth-me.handler";
import { jwtAuthGuard } from "../api/guards/jwt-auth.guard";
import { createRegistrationHandler } from "./http-handlers/create-registration.handler";

export const authRoute = Router();

// * GET
// Get info about current user
authRoute.get("", jwtAuthGuard, getAuthMeHandler);

// * POST
// Try login user to the system
authRoute.post(
  "",
  loginOrEmailAuthRPValidation,
  inputResultMiddlewareValidation,
  createLoginHandler
);

// Registration in the system. Email with confirmation code will be send to passed email address.
authRoute.post("", createRegistrationHandler);
