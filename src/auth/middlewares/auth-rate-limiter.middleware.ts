import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

export const authRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 10 * 1000, // 10сек
  max: 5, // максимум 5 запроссов
  standardHeaders: true, // добавляет RateLimit-заголовки
  legacyHeaders: false, // не добавляет X-RateLimit-*

  skip: () => process.env.NODE_ENV === "test",
  skipFailedRequests: false,
  skipSuccessfulRequests: false,

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
