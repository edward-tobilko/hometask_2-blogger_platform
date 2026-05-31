import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { appSetup } from './setup/app.setup';
import { CoreConfig } from './core/core.config';
import { initAppModule } from './init-app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const dynamicAppModule = await initAppModule();

    // * Создаём на основе донастроенного модуля наше приложение с условным TestingDataModule
    const app = await NestFactory.create(dynamicAppModule);

    const coreConfig = app.get(CoreConfig);

    // * Глобальные настройки приложения
    appSetup(app, coreConfig.isSwaggerEnabled);

    // * Hosting подставляет свой порт, локально — 3000
    const PORT = coreConfig.port;
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
