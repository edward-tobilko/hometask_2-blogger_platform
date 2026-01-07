import { Request, Response } from "express";

import { errorsHandler } from "../../../core/errors/errors-handler.error";

import { userQueryService } from "../../../users/applications/users-query.service";
import { AuthMeOutput } from "../../application/output/auth-me.output";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { JWTService } from "auth/adapters/jwt-service.adapter";

export async function getAuthMeHandler(req: Request, res: Response) {
  try {
    // * Если jwtAuthGuard прошел → userId уже есть
    let userId = req.user.id;

    // * Если userId отсутствует → достаем refreshToken из cookie
    if (!userId) {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);
      }

      // * Проверяем refresh token и получаем userId
      const refreshPayload = await JWTService.verifyRefreshToken(refreshToken);

      if (!refreshPayload)
        return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      userId = refreshPayload.userId;

      // * Создаем новые токены
      const newAccessToken = await JWTService.createAccessToken(userId);
      const newRefreshToken = await JWTService.createRefreshToken(
        userId,
        refreshPayload.deviceId
      );

      // * Устанавлеваем cookie с новым refresh
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false, // для https = true
        sameSite: "strict",
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
