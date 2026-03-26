import { NextFunction, Request, Response } from "express";

import { IJWTService } from "auth/interfaces/IJWTService";

export const optionalJwtAccessGuard = (jwtService: IJWTService) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;

    if (!auth) return next(); // * Публичный доступ

    const [type, token] = auth.split(" ");

    if (type !== "Bearer" || !token) return next();

    try {
      const payload = await jwtService.verifyAccessToken(token); // return userId: string or null

      if (payload?.userId) {
        req.user = { id: payload.userId };

        console.log("REQ.USER SET:", req.user);
      } else {
        console.log("PAYLOAD HAS NO userId");
      }
    } catch (error: unknown) {
      // * Игнорируем плохой токен, чтобы чтение оставалось публичным
      console.error("JWT VERIFY ERROR:", error);
    }

    return next();
  };
};
