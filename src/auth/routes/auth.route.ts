import { Router } from "express";
import { body } from "express-validator";

import { loginOrEmailAuthRPValidation } from "./request-payload-validations/login-auth.request-payload-types";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { loginHandler } from "./http-handlers/login.handler";
import { getAuthMeHandler } from "./http-handlers/get-auth-me.handler";
import { jwtAccessAuthGuard } from "../api/guards/jwt-access-auth.guard";
import { registrationHandler } from "./http-handlers/registration.handler";
import { registrationAuthRPValidation } from "./request-payload-validations/registration-auth.request-payload-validation";
import { confirmRegistrationHandler } from "./http-handlers/confirm-registration.handler";
import { registrationEmailResendingHandler } from "./http-handlers/registration-email-resending.handler";
import { refreshTokenHandler } from "./http-handlers/refresh-token.handler";
import { logoutHandler } from "./http-handlers/logout.handler";
import { CustomRateLimitRepo } from "@core/repositories/custom-rate-limit.repo";
import { customRateLimiterMiddleware } from "@core/middlewares/custom-rate-limiter.middleware";

export const createAuthRouter = (repo: CustomRateLimitRepo) => {
  const authRoute = Router();

  const authCustomRateLimiter = customRateLimiterMiddleware(repo, {
    windowMs: 10_000, // каждые 10сек можно повторять попытку отправки
    max: 2, // max count
  });

  // * GET: Get info about current user.
  authRoute.get("/me", jwtAccessAuthGuard, getAuthMeHandler);

  // * POST: Try login user to the system.
  authRoute.post(
    "/login",
    authCustomRateLimiter,
    loginOrEmailAuthRPValidation,
    inputResultMiddlewareValidation,
    loginHandler
  );

  // * POST: Registration in the system. Email with confirmation code will be send to passed email address.
  authRoute.post(
    "/registration",
    authCustomRateLimiter,
    registrationAuthRPValidation,
    inputResultMiddlewareValidation,
    registrationHandler
  );

  // * POST: Confirm registration.
  authRoute.post(
    "/registration-confirmation",
    authCustomRateLimiter,

    body("code")
      .exists()
      .withMessage("Code is required")
      .bail()
      .isString()
      .withMessage("Code must be a string"),

    inputResultMiddlewareValidation,
    confirmRegistrationHandler
  );

  // * POST: Resend confirmation registration  email if user exist.
  authRoute.post(
    "/registration-email-resending",
    authCustomRateLimiter,

    body("email")
      .exists()
      .withMessage("Email is required")
      .bail()
      .isString()
      .withMessage("Email must be a string")
      .trim()
      .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
      .withMessage("Email must be a valid email"),

    inputResultMiddlewareValidation,
    registrationEmailResendingHandler
  );

  // * POST: Generate new pair of access and refresh tokens (in cookie client must send correct refresh token that will be revoked after refreshing). Device LastActiveDate should be overrode by issued Date of new refresh.
  authRoute.post("/refresh-token", refreshTokenHandler);

  // * POST: In cookie client must send correct refresh token that will be revoked.
  authRoute.post("/logout", logoutHandler);

  return authRoute;
};

// ? POST /auth/refresh-token что делает: берет refreshToken из cookie -> verify refreshToken (RT_SECRET) -> получает userId, deviceId -> ищет сессию по deviceId и сверяет refreshToken (чтобы не подсунули чужой/старый) -> генерирует новый access + новый refresh -> обновляет refreshToken в БД (ротация) -> ставит refresh cookie + возвращает accessToken в body.
