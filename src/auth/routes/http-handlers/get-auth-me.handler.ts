import { Request, Response } from "express";

import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { userQueryService } from "../../../users/applications/users-query.service";
import { AuthMeOutput } from "../../application/output/auth-me.output";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { authService } from "auth/application/session.service";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { mapApplicationStatusToHttpStatus } from "@core/result/map-app-status-to-http.result";
import { ApplicationError } from "@core/errors/application.error";

export async function getAuthMeHandler(req: Request, res: Response) {
  try {
    // * Если jwtAuthGuard прошел → userId уже есть
    const userId = req.user?.id;

    // * Если userId отсутствует → достаем refreshToken из cookie
    if (!userId) {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
      }

      const resultTokens = await authService.refreshTokens(refreshToken);

      if (
        resultTokens.status !== ApplicationResultStatus.Success ||
        !resultTokens.data
      )
        return res
          .status(mapApplicationStatusToHttpStatus(resultTokens.status))
          .json({
            errorsMessages: resultTokens.extensions.map(
              (err: ApplicationError) => ({
                message: err.message,
                field: err.field,
              })
            ),
          });

      const { newAccessToken, newRefreshToken } = resultTokens.data!;

      // * Устанавлеваем cookie с новым refresh
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true, // нету доступа для JS
        secure: process.env.NODE_ENV === "production" || false, // для https = true
        sameSite: "strict", // нужна для защиты от кросс-доменных подмен кук
        path: "/",
        // maxAge: 20 * 1000, // 20s как в swagger (но лучше брать с appConfig.RT_TIME)
      });

      // * Отправляем accessToken (либо в headers, либо в body)
      // res.setHeader("x-access-token", newAccessToken)

      res.json({ accessToken: newAccessToken });
    }

    // * Достаем юзера
    const me = await userQueryService.getUserById(userId);

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
    errorsHandler(error, req, res);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
