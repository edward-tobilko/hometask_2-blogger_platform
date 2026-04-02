import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { matchedData } from "express-validator";

import { DiTypes } from "@core/di/types";
import { ApplicationError } from "@core/errors/application.error";
import { errorsHandler } from "@core/errors/errors-handler.error";
import { mapApplicationStatusToHttpStatus } from "@core/result/map-app-status-to-http.result";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { AuthMeOutput } from "@auth/application/output/auth-me.output";
import { LoginAuthRP } from "../request-payload-types/login-auth.request-payload-type";
import { createCommand } from "@core/helpers/create-command.helper";
import { LoginAuthDtoCommand } from "auth/application/commands/login-auth-dto.command";
import { IJWTService } from "@auth/application/interfaces/jwt-service.interface";
import { IAuthService } from "@auth/application/interfaces/auth-service.interface";
import { IUsersQueryService } from "@users/application/interfaces/users-query-service.interface";
import { NewPasswordRP } from "../request-payload-types/new-password.request-payload-type";
import { CreateUserRP } from "@users/presentation/request-payload-types/create-user.request-payload-types";

@injectable()
export class AuthController {
  constructor(
    @inject(DiTypes.IAuthService) private authService: IAuthService,
    @inject(DiTypes.IUsersQueryService)
    private usersQueryService: IUsersQueryService,
    @inject(DiTypes.IJWTService) private jwtService: IJWTService
  ) {}

  async loginHandler(req: Request, res: Response) {
    try {
      const sanitizedBodyParam = matchedData<LoginAuthRP>(req, {
        locations: ["body"],
        includeOptionals: false,
      });

      const command = createCommand<LoginAuthDtoCommand>(sanitizedBodyParam, {
        userAgent: req.headers["user-agent"],
        ip: req.ip || "unknown",
      });

      const result = await this.authService.loginUser(command);

      if (result.status !== ApplicationResultStatus.Success)
        return res
          .status(mapApplicationStatusToHttpStatus(result.status))
          .json({
            errorsMessages: result.extensions.map((err: ApplicationError) => ({
              message: err.message,
              field: err.field,
            })),
          });

      const { accessToken, expiresAt, refreshToken } = result.data!;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" || false, // для https = true
        sameSite: "strict", // нужна для защиты от кросс-доменных подмен кук
        path: "/",
        expires: expiresAt, // дата должна быть та же, что и в БД
      });

      return res.status(HTTP_STATUS_CODES.OK_200).json({ accessToken });
    } catch (error: unknown) {
      console.error("[loginHandler] error:", error);

      errorsHandler(error, req, res);
    }
  }

  async passwordRecoveryHandler(
    req: Request<{}, {}, { email: string }, {}>,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { email } = req.body;

      await this.authService.passwordRecovery(email);

      res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      console.error("[passwordRecoveryHandler] error:", error);

      errorsHandler(error, req, res);
    }
  }

  async newPasswordHandler(req: Request, res: Response) {
    try {
      const { newPassword, recoveryCode } = matchedData<NewPasswordRP>(req, {
        locations: ["body"],
        includeOptionals: false,
      });

      const result = await this.authService.confirmNewPasswordRecovery(
        newPassword,
        recoveryCode
      );

      if (result.status !== ApplicationResultStatus.NoContent) {
        return res
          .status(mapApplicationStatusToHttpStatus(result.status))
          .json({
            errorsMessages: result.extensions.map((err: ApplicationError) => ({
              message: err.message,
              field: err.field,
            })),
          });
      }

      return res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      console.error("ERROR:", error);

      errorsHandler(error, req, res);
    }
  }

  async refreshTokenHandler(req: Request, res: Response) {
    try {
      const oldRefreshTokenFromCookie = req.cookies.refreshToken;

      if (!oldRefreshTokenFromCookie)
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      const result = await this.authService.getRefreshToken(
        oldRefreshTokenFromCookie
      );

      if (!result?.isSuccess() || !result.data)
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      // * добавляем новый refresh в cookie
      res.cookie("refreshToken", result.data.refreshToken, {
        path: "/",
        secure: process.env.NODE_ENV === "production" || false, // if https -> true
        httpOnly: true,
        sameSite: "strict", // нужна для защиты от кросс-доменных подмен кук (lax - выключено)
      });

      // * возвращаем новый accessToken
      res
        .status(HTTP_STATUS_CODES.OK_200)
        .json({ accessToken: result.data.accessToken });
    } catch (error: unknown) {
      console.error("ERROR:", error);

      errorsHandler(error, req, res);
    }
  }

  async confirmRegistrationHandler(
    req: Request<{}, {}, { code: string }, {}>,
    res: Response
  ) {
    try {
      const { code } = req.body;

      const result = await this.authService.confirmRegistration(code);

      if (result.status !== ApplicationResultStatus.Success) {
        return res
          .status(mapApplicationStatusToHttpStatus(result.status))
          .json({
            errorsMessages: result.extensions.map((err: ApplicationError) => ({
              message: err.message,
              field: err.field,
            })),
          });
      }

      return res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      errorsHandler(error, req, res);

      console.error("ERROR:", error);
    }
  }

  async registrationHandler(
    req: Request<{}, {}, CreateUserRP, {}>,
    res: Response
  ) {
    try {
      const { login, password, email } = req.body;

      const resultUser = await this.authService.registerUser(
        login,
        password,
        email
      );

      if (resultUser.status !== ApplicationResultStatus.Success) {
        return res
          .status(mapApplicationStatusToHttpStatus(resultUser.status))
          .json({
            errorsMessages: resultUser.extensions.map(
              (err: ApplicationError) => ({
                message: err.message,
                field: err.field,
              })
            ),
          });
      }

      return res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      console.error("ERROR:", error);

      errorsHandler(error, req, res);
    }
  }

  async registrationEmailResendingHandler(
    req: Request<{}, {}, { email: string }>,
    res: Response
  ) {
    try {
      const { email } = req.body;

      const result = await this.authService.resendRegistrationEmail(email);

      if (result.status !== ApplicationResultStatus.Success) {
        return res
          .status(mapApplicationStatusToHttpStatus(result.status))
          .json({
            errorsMessages: result.extensions.map((err: ApplicationError) => ({
              message: err.message,
              field: err.field,
            })),
          });
      }

      return res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      console.error("ERROR:", error);

      errorsHandler(error, req, res);
    }
  }

  async logoutHandler(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken)
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      const payload = await this.jwtService.verifyRefreshToken(refreshToken);

      if (!payload) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      const result = await this.authService.logout(payload);

      if (!result.isSuccess()) {
        return res.sendStatus(mapApplicationStatusToHttpStatus(result.status));
      }

      res.clearCookie("refreshToken");
      res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      console.error("ERROR:", error);

      errorsHandler(error, req, res);
    }
  }

  async getAuthMeHandler(req: Request, res: Response) {
    try {
      // * Если jwtAuthGuard прошел → userId уже есть
      const userId = req.user.id;

      // * Достаем юзера
      const me = await this.usersQueryService.getUserById(userId);

      if (!me) {
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
      }

      const authMeOutput: AuthMeOutput = {
        email: me.email,
        login: me.login,
        userId: me.id,
      };

      res.status(HTTP_STATUS_CODES.OK_200).json(authMeOutput);
    } catch (error: unknown) {
      console.error("ERROR:", error);

      errorsHandler(error, req, res);
    }
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
