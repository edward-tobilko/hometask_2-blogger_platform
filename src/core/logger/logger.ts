import pino from "pino";

import { appConfig } from "@core/settings/config";

export const log = pino({
  ...(appConfig.NODE_ENV !== "test" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
      },
    },
  }),

  level: appConfig.NODE_ENV === "production" ? "info" : "debug",
});

// ? Теперь используем этот плагин, вместо console.log().

// * ❌ было
// ? console.log("ERROR HANDLER:", error);
// ? console.log("REQ.USER SET:", req.user);

// * ✅ стало
// ? logger.error({ error }, "ERROR HANDLER");
// ? logger.info({ user: req.user }, "REQ.USER SET");
// ? logger.debug({ postId }, "Fetching post");

// * Уровни логирования:
// ? logger.trace("самый детальный");
// ? logger.debug("для разработки");
// ? logger.info("обычные события");
// ? logger.warn("предупреждения");
// ? logger.error("ошибки");
// ? logger.fatal("критические ошибки");
