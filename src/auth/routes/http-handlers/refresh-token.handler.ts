import { Request, Response } from "express";
import { log } from "console";
import { ObjectId } from "mongodb";

import { errorsHandler } from "@core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { JWTService } from "auth/adapters/jwt-service.adapter";
import { AuthRepository } from "auth/repositories/auth.repository";

export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const refreshTokenFromCookie = req.cookies.refreshToken;
    if (!refreshTokenFromCookie)
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const payload = await JWTService.verifyRefreshToken(refreshTokenFromCookie);
    if (!payload) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const { userId, deviceId } = payload;

    // * проверка сессии в БД
    const session = await AuthRepository.findSession(
      new ObjectId(userId),
      deviceId
    );
    if (!session) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    // * если в БД другой refreshToken → значит этот токен уже ротирован / украден / старый
    if (session.refreshToken !== refreshTokenFromCookie)
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    // * создаем новую пару токенов
    const newAccessToken = await JWTService.createAccessToken(userId);
    const newRefreshToken = await JWTService.createRefreshToken(
      userId,
      deviceId
    );

    // * обновляем сессию в БД
    await AuthRepository.updateSessionRefreshToken(
      new ObjectId(userId),
      deviceId,
      {
        refreshToken: newRefreshToken,
        lastActiveDate: new Date(),
      }
    );

    // * добавляем новый refresh в cookie
    res.cookie("refreshToken", newRefreshToken, {
      path: "/",
      secure: false, // if https -> true
      httpOnly: true,
      sameSite: "lax",
    });

    log(session);

    // * возвращаем новый accessToken
    res.status(HTTP_STATUS_CODES.OK_200).json({ accessToken: newAccessToken });
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
