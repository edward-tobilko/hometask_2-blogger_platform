import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { CoreConfig } from './core.config';

@Global() // всё что этот модуль экспортирует (for example CoreConfig in exports:[...]), автоматически доступно в любых других модулях без его явного импорта.
@Module({
  imports: [ConfigModule, CqrsModule],

  providers: [CoreConfig],

  exports: [CoreConfig, CqrsModule],
})
export class CoreModule {}

// ? core: общая папка для проекта. Тут содержаться общая функциональность для всего проекта. Глобальный CoreModule объединяет в себе общие провайдеры для всего проекта.

// ? CqrsModule (без forRoot()) - регистрирует базовые провайдеры: CommandBus, QueryBus, EventBus, CommandPublisher.
// ? CqrsModule.forRoot() -  делает всё то же самое + регистрирует UnhandledExceptionBus — шину для необработанных исключений в async хэндлерах. Нужен если мы хочем глобально ловить ошибки из use cases.
