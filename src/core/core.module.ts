import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CoreConfig } from './core.config';

@Global() // всё что этот модуль экспортирует (for example CoreConfig in exports:[...]), автоматически доступно в любом модуле без явного импорта.
@Module({
  imports: [ConfigModule],

  providers: [CoreConfig],

  exports: [CoreConfig],
})
export class CoreModule {}

// ? core: общая папка для проекта. Тут содержаться общая функциональность для всего проекта. Глобальный CoreModule объединяет в себе общие провайдеры для всего проекта.
