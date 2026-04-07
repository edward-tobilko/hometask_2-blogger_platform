import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";

import { appConfig } from "@core/settings/config";
import { AppModule } from "app.module";
import { log } from "@core/logger/logger";

async function bootstrap() {
  // * Hosting подставляет свой порт, локально — 8080
  const PORT = appConfig.PORT;
  const HOST = "0.0.0.0";

  if (!PORT) throw new Error("PORT is not set");

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.enableCors({}); // for CORS domain requests

    await app.listen(PORT, HOST, () => {
      log.debug(`✅ Server running on ${PORT} PORT`);
    });
  } catch (error: unknown) {
    log.error({ error }, "❌ Failed to start app:");
    process.exit(1);
  }
}

bootstrap();
