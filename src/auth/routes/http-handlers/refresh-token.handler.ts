import { Request, Response } from "express";
import { log } from "console";
import { ObjectId } from "mongodb";

import { errorsHandler } from "@core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { JWTService } from "auth/adapters/jwt-service.adapter";
import { AuthRepository } from "auth/repositories/auth.repository";

export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const oldRefreshTokenFromCookie = req.cookies.refreshToken;
    if (!oldRefreshTokenFromCookie)
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    // * Если токен уже в черном списке — это либо повтор, либо атака
    const isBlackList = await AuthRepository.isBlackListed(
      oldRefreshTokenFromCookie
    );
    if (isBlackList) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const payload = await JWTService.verifyRefreshToken(
      oldRefreshTokenFromCookie
    );
    if (!payload) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const { userId, deviceId } = payload;

    // * проверка активной сессии (смотреть в browser -> application -> cookie -> session (the firth row)) в БД
    const session = await AuthRepository.findSession(
      new ObjectId(userId),
      deviceId
    );
    if (!session) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    // * если в БД другой refreshToken → значит этот токен уже ротирован / украден / старый - базовый «reuse protection» через single valid token per session.
    if (session.refreshToken !== oldRefreshTokenFromCookie)
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    // * заносим старый refresh в blacklist
    const expiredDate =
      JWTService.getRefreshTokenExpiresDate(oldRefreshTokenFromCookie) ??
      new Date(Date.now() + 24 * 60 * 60 * 1000);

    await AuthRepository.addTokenToBlackList({
      refreshToken: oldRefreshTokenFromCookie,
      userId: new ObjectId(userId),
      deviceId,
      expiresAt: expiredDate,
      reason: "rotated",
    });

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
      sameSite: "lax", // нужна для защиты от кросс-доменных подмен кук (lax - выключено)
    });

    log("new auth for DB ->", session);

    // * возвращаем новый accessToken
    res.status(HTTP_STATUS_CODES.OK_200).json({ accessToken: newAccessToken });
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
