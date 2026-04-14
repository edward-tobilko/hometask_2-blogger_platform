import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // * Hosting подставляет свой порт, локально — 3000 or 8080
    const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
    const HOST = '0.0.0.0';

    app.enableCors({}); // for CORS domain requests

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true, // разрешает @Transform декораторы работать (без этого, например, строки не превратятся в числа)
        whitelist: true, // убирает из DTO поля, которых нет в классе (защита от лишних данных в запросе)
        forbidNonWhitelisted: true, // работает в паре с whitelist — отвергает запрос с ошибкой 400, если есть лишние поля. Без этого whitelist просто проигнорит лишнее поле.
      }),
    ); // метод для глобальной регистрации пайпов

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
