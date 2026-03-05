import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { ICustomRateLimit } from "@core/interfaces/custom-rate-limit.interface";

type Options = {
  windowMs: number; // 10_000
  max: number; // 5
};

export const customRateLimiterMiddleware =
  (repo: ICustomRateLimit, options: Options) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const disableRateLimit =
      process.env.NODE_ENV === "test" ||
      process.env.DISABLE_RATE_LIMIT === "true";

    if (disableRateLimit) return next(); // for e2e tests (что бы не ламало тесты)

    try {
      const ip = req.ip || "unknown";
      const url = `${req.baseUrl}${req.path}`;

      const from = new Date(Date.now() - options.windowMs);

      //  * считаем сколько было за окно
      const count = await repo.countRateLimit(ip, url, from);

      if (count >= options.max) {
        return res.status(HTTP_STATUS_CODES.TOO_MANY_REQUESTS_429).json({
          errorsMessages: [
            {
              message: "Too many requests. Please try again later.",
              field: "many-requests",
            },
          ],
        });
      }

      await repo.addRateLimit(ip, url);

      return next();
    } catch (e) {
      console.error("Rate limiter error:", e);

      res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
    }
  };
