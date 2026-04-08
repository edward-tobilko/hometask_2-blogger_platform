import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // * Hosting подставляет свой порт, локально — 3000 or 8080
    const PORT = Number(process.env.PORT) ?? 8080;
    const HOST = '0.0.0.0';

    app.enableCors({}); // for CORS domain requests
    app.setGlobalPrefix('api'); // теперь все маршруты будут начинаться с /api/...

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

bootstrap();

// ? logger.error(message: any, stack?: string, context?: string)
