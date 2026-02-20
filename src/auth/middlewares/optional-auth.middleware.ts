import { NextFunction, Request, Response } from "express";

import { IJWTService } from "./../interfaces/IJWTService";
import { IdType } from "@core/types/id";

export function optionalAuthMiddleware(jwtService: IJWTService) {
  return async function (req: Request, _res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      // * Если токена нет - это OK, просто не добавляем user
      if (!authHeader) return next();

      if (!authHeader.startsWith("Bearer ")) return next();

      const token = authHeader.split(" ")[1];

      if (!token) return next();

      // * Пытаемся верифицировать токен
      const decoded = await jwtService.verifyAccessToken(token);

      if (!decoded) return null;

      const { userId } = decoded; // userId достаем с метода createAccessToken в который мы положили как props

      // * Добавляем пользователя в request
      req.user = { id: userId } as IdType; // req.user adding from express.d.ts

      next();
    } catch (error) {
      console.log(
        "❌ Token verification failed:",
        error instanceof Error ? error.message : error
      );

      // * Токен невалидный - это OK для опциональной авторизации
      next();
    }
  };
}
