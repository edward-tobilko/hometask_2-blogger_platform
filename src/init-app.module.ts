import { NestFactory } from '@nestjs/core';
import { DynamicModule } from '@nestjs/common';

import { CoreModule } from './core/core.module';
import { CoreConfig } from './core/core.config';
import { AppModule } from './app.module';

// * Создаем временное мини-приложение только для получения CoreConfig
export const initAppModule = async (): Promise<DynamicModule> => {
  const appContext = await NestFactory.createApplicationContext(CoreModule);
  const coreConfig = appContext.get(CoreConfig);

  await appContext.close();

  return AppModule.forRoot(coreConfig);
};

// ? initAppModule - вспомагательная ф-я для переиспользованния ее в проекте и тестовом окружении.
