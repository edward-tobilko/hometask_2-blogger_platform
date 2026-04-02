import { Router } from "express";
import { body } from "express-validator";

import { loginOrEmailAuthRPValidation } from "../request-payload-validations/login-auth.request-payload-types";
import { inputResultMiddlewareValidation } from "../../../core/middlewares/validation/input-result.middleware-validation";
import { jwtAccessAuthGuard } from "../guards/jwt-access-auth.guard";
import { registrationAuthRPValidation } from "../request-payload-validations/registration-auth.request-payload-validation";
import { AuthController } from "../controllers/auth.controller";
import { customRateLimiterMiddleware } from "@core/middlewares/custom-rate-limiter.middleware";
import { ICustomRateLimit } from "@core/interfaces/custom-rate-limit.interface";
import { IJWTService } from "@auth/application/interfaces/jwt-service.interface";
import { newPasswordRPV } from "../request-payload-validations/new-password.rpv";
import { ISessionQueryRepo } from "@auth/application/interfaces/session-query-repo.interface";

export const createAuthRouter = (
  customRateLimitRepo: ICustomRateLimit,
  authController: AuthController,
  jwtService: IJWTService,
  sessionQueryRepo: ISessionQueryRepo
) => {
  const authRoute = Router();

  const authCustomRateLimiter = customRateLimiterMiddleware(
    customRateLimitRepo,
    {
      windowMs: 10_000, // каждые 10сек можно повторять попытку отправки
      max: 5, // max count
    }
  );

  // * POST: Try login user to the system.
  authRoute.post(
    "/login",
    loginOrEmailAuthRPValidation,
    inputResultMiddlewareValidation,
    authCustomRateLimiter,

    authController.loginHandler.bind(authController)
  );

  // * POST: Password recovery via email confirmation. Email should be sent with RecoveryCode inside.
  authRoute.post(
    "/password-recovery",

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
    authCustomRateLimiter,

    authController.passwordRecoveryHandler.bind(authController)
  );

  // * POST: Confirm password recovery.
  authRoute.post(
    "/new-password",
    newPasswordRPV,
    inputResultMiddlewareValidation,
    authCustomRateLimiter,

    authController.newPasswordHandler.bind(authController)
  );

  // * POST: Generate new pair of access and refresh tokens (in cookie client must send correct refresh token that will be revoked after refreshing). Device LastActiveDate should be overrode by issued Date of new refresh token.
  authRoute.post(
    "/refresh-token",

    authController.refreshTokenHandler.bind(authController)
  );

  // * POST: Confirm registration.
  authRoute.post(
    "/registration-confirmation",

    body("code")
      .exists()
      .withMessage("Code is required")
      .bail()
      .isString()
      .withMessage("Code must be a string"),

    inputResultMiddlewareValidation,
    authCustomRateLimiter,

    authController.confirmRegistrationHandler.bind(authController)
  );

  // * POST: Registration in the system. Email with confirmation code will be send to passed email address.
  authRoute.post(
    "/registration",
    registrationAuthRPValidation,
    inputResultMiddlewareValidation,
    authCustomRateLimiter,

    authController.registrationHandler.bind(authController)
  );

  // * POST: Resend confirmation registration  email if user exist.
  authRoute.post(
    "/registration-email-resending",

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
    authCustomRateLimiter,

    authController.registrationEmailResendingHandler.bind(authController)
  );

  // * POST: In cookie client must send correct refresh token that will be revoked.
  authRoute.post("/logout", authController.logoutHandler.bind(authController));

  // * GET: Get info about current user.
  authRoute.get(
    "/me",
    jwtAccessAuthGuard(jwtService, sessionQueryRepo),

    authController.getAuthMeHandler.bind(authController)
  );

  return authRoute;
};

// ? POST /auth/refresh-token что делает: берет refreshToken из cookie -> verify refreshToken (RT_SECRET) -> получает userId, deviceId -> ищет сессию по deviceId и сверяет refreshToken (чтобы не подсунули чужой/старый) -> генерирует новый access + новый refresh -> обновляет refreshToken в БД (ротация) -> ставит refresh cookie + возвращает accessToken в body.
