import { Module } from '@nestjs/common';

@Module({
  imports: [],

  controllers: [],
  providers: [],

  exports: [],
})
export class CoreModule {}

// ? core: общая папка для проекта. Тут содержаться общая функциональность для всего проекта. Глобальный CoreModule объединяет в себе общие провайдеры для всего проекта.
