import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    appSetup(app);

    // * Hosting подставляет свой порт, локально — 3000 or 8080
    const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
    const HOST = '0.0.0.0';

    app.enableCors({}); // for CORS domain requests

    await app.listen(PORT, HOST);

    logger.log(`✅ Server running on ${PORT} PORT`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('❌ Failed to start app', error.stack);
    } else {
      logger.error('❌ Failed to start app', String(error));
    }

    process.exit(1);
  }
}

void bootstrap();

// ? logger.error(message: any, stack?: string, context?: string).

// ? void — оператор, который явно говорит: "я знаю, что это Promise, я намеренно его не жду". ESLint примет это как осознанное решение.
