import { NextFunction, Request, Response } from "express";

import { CustomRateLimitRepo } from "@core/repositories/custom-rate-limit.repo";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

type Options = {
  windowMs: number; // 10_000
  max: number; // 5
};

export const customRateLimiterMiddleware =
  (repo: CustomRateLimitRepo, options: Options) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const isE2E = process.env.NODE_ENV === "test";
    const disableRateLimit = process.env.DISABLE_RATE_LIMIT === "true";

    if (isE2E && disableRateLimit) return next(); // for e2e tests (что бы не ламало тесты)

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
