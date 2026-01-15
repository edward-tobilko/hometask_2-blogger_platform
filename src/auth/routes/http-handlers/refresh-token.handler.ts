import { Request, Response } from "express";
import { log } from "console";

import { errorsHandler } from "@core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { authService } from "auth/application/auth.service";

export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const oldRefreshTokenFromCookie = req.cookies.refreshToken;
    if (!oldRefreshTokenFromCookie)
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const result = await authService.getRefreshTokens(
      oldRefreshTokenFromCookie
    );

    if (!result?.isSuccess() || !result.data)
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    // * добавляем новый refresh в cookie
    res.cookie("refreshToken", result.data.refreshToken, {
      path: "/",
      secure: true, // if https -> true
      httpOnly: true,
      sameSite: "strict", // нужна для защиты от кросс-доменных подмен кук (lax - выключено)
    });

    log("refresh success ->", result.data);

    // * возвращаем новый accessToken
    res
      .status(HTTP_STATUS_CODES.OK_200)
      .json({ accessToken: result.data.accessToken });
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
