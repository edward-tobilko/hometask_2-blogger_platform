import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getOptionsToken } from '@nestjs/throttler';

import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';

export async function initApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule], // что бы тестировать РЕАЛЬНОЕ приложение — со всеми pipe, guard, filter
  })
    .overrideProvider(getOptionsToken()) // ThrottlerGuard - читает настройки через DI токен 'THROTTLER:MODULE_OPTIONS' -> getOptionsToken() - возвращает строку 'THROTTLER:MODULE_OPTIONS'.
    .useValue([{ limit: 10000, ttl: 60000 }]) // что бы тесты не получали 429
    .compile();

  const app = moduleFixture.createNestApplication();

  appSetup(app); // применяем те же настройки что и в проде: global prefix /api, ValidationPipe, ExceptionFilter. Без этого тесты проверяли бы другое приложение, а не то что деплоится.

  await app.init();

  return app;
}

// ? initApp - Создаёт и запускает настоящее NestJS приложение для E2E тестов.
