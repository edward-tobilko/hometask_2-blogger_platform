import { Router } from "express";

import { loginOrEmailAuthRPValidation } from "./request-payload-validations/login-auth.request-payload-types";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { createLoginHandler } from "./http-handlers/create-login.handler";
import { getAuthMeHandler } from "./http-handlers/get-auth-me.handler";
import { jwtAuthGuard } from "../api/guards/jwt-auth.guard";
import { createRegistrationHandler } from "./http-handlers/create-registration.handler";
import { registrationAuthRPValidation } from "./request-payload-validations/registration-auth.request-payload-validation";
import { body } from "express-validator";
import { createRegistrConfirmHandler } from "./http-handlers/create-registr-confirm.handler";

export const authRoute = Router();

// * GET
// Get info about current user
authRoute.get("/me", jwtAuthGuard, getAuthMeHandler);

// * POST
// Try login user to the system
authRoute.post(
  "/login",
  loginOrEmailAuthRPValidation,
  inputResultMiddlewareValidation,
  createLoginHandler
);

// Registration in the system. Email with confirmation code will be send to passed email address.
authRoute.post(
  "/registration",
  registrationAuthRPValidation,
  inputResultMiddlewareValidation,
  createRegistrationHandler
);

authRoute.post(
  "/registration-confirmation",
  body("code")
    .exists()
    .withMessage("Code is required")
    .bail()
    .isString()
    .withMessage("Code must be a string"),
  inputResultMiddlewareValidation,
  createRegistrConfirmHandler
);
