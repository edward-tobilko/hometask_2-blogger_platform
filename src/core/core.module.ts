import { Global, Module } from '@nestjs/common';
import { CoreConfig } from './core.config';

// * глобальный модуль для провайдеров и модулей необходимых во всех частях приложения (например LoggerService, CqrsModule, etc...)
@Global()
@Module({
  imports: [],

  controllers: [],
  providers: [CoreConfig],

  exports: [CoreConfig],
})
export class CoreModule {}

// ? core: общая папка для проекта. Тут содержаться общая функциональность для всего проекта. Глобальный CoreModule объединяет в себе общие провайдеры для всего проекта.
