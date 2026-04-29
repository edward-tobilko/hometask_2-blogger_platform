import { Global, Module } from '@nestjs/common';

// * глобальный модуль для провайдеров и модулей необходимых во всех частях приложения (например LoggerService, CqrsModule, etc...)
@Global()
@Module({
  imports: [],

  controllers: [],
  providers: [],

  exports: [],
})
export class CoreModule {}

// ? core: общая папка для проекта. Тут содержаться общая функциональность для всего проекта. Глобальный CoreModule объединяет в себе общие провайдеры для всего проекта.
