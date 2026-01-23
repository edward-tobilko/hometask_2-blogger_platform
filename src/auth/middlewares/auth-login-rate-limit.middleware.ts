import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { Request } from "express";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

const ipKeyGenerator = (req: Request): string => {
  return req.ip || req.socket.remoteAddress || "unknown-ip";
};

export const authLoginRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 10 * 1000, // 10 сек
  max: 5, // максимум 5 запроссов
  standardHeaders: true, // добавляет RateLimit-заголовки
  legacyHeaders: false, // не добавляет X-RateLimit-*
  keyGenerator: ipKeyGenerator,
  message: {
    errorsMessages: [
      {
        message: "Too many requests. Please try again later.",
        field: "many-requests",
      },
    ],
  },

  handler: (req, res, _next, options) => {
    res
      .status(HTTP_STATUS_CODES.TOO_MANY_REQUESTS_429)
      .json(
        typeof options.message === "function"
          ? options.message(req, res)
          : options.message
      );
  },
});
