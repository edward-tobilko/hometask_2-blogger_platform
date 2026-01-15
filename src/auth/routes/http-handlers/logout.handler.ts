import { Request, Response } from "express";

import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { JWTService } from "auth/adapters/jwt-service.adapter";
import { AuthRepository } from "auth/repositories/auth.repository";
import { ObjectId } from "mongodb";
import { authService } from "auth/application/auth.service";

export const logoutHandler = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const payload = await JWTService.verifyRefreshToken(refreshToken);
    if (!payload) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const session = await authService.getSession(
      payload.userId,
      payload.deviceId
    );

    if (!session) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    // * проверяем, что токен актуален (rotation guard)
    if (session.refreshToken !== refreshToken)
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    await AuthRepository.deleteAuthMe(
      new ObjectId(payload.userId),
      payload.deviceId
    );

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true, // для https = true
      sameSite: "strict", // нужна для защиты от кросс-доменных подмен кук (lax - выключено)
      path: "/",
    });

    return res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
