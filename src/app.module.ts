import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestingDataModule } from './modules/testing/testing-data.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { CoreModule } from './core/core.module';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';
import { configModule } from './config/dynamic.config-module';
import { mongooseModule } from './config/mongoose.module';
import { throttlerModule } from './config/throttler.module';
import { CoreConfig } from './core/core.config';
// import { CounterModule } from './modules/scope-logger-example/counter.module';

@Module({
  // * классы-модули — уже собранные блоки с controllers / providers (какие другие модули нам нужны)
  imports: [
    configModule,
    mongooseModule,

    // * ограничение количества запросов с одного IP (Максимум 10 запросов за 60 секунд с одного IP).
    throttlerModule,

    // * импортируем модули, что бы переиспользовать их провайдеры (из массива exports)
    BloggersPlatformModule,
    UserAccountsModule,
    // CounterModule,

    CoreModule,
  ],

  // * обработчики HTTP-запросов (они инжектятся в DI, но не "используются" другими классами — они точка входа HTTP-запросов)
  controllers: [AppController],

  // * отдельные классы — сервисы, репозитории, гарды и тд... (все что инжектиться). Это то, что Nest регистрирует в DI-контейнере модуля и умеет инжектить через конструктор.
  providers: [
    AppService,

    // * регистрация глобальных exception filters, важен порядок регистрации! Первым сработает DomainHttpExceptionsFilter! В NestJS глобальные фильтры применяются в порядке LIFO (последний зарегистрированный — первый срабатывает).
    {
      provide: APP_FILTER, // работает через DI-контейнер NestJS, поэтому в фильтр можно инжектить зависимости через конструктор
      useClass: AllHttpExceptionsFilter,
    },

    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },

    // * ограничение количества запросов с одного IP (распространяеться на все роуты, если хотим отдельно на кажный роут -> @UseGuards(ThrottlerGuard) над каждым декоратором (@Post() / @Get() etc...)).
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],

  // * что из providers мы "разрешаем использовать" другим модулям (инкапсуляция)
  exports: [],
})
export class AppModule {
  // * Такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль. Что бы не обращаться к переменной окружения через process.env в декораторе, потому что запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS.

  static forRoot(coreConfig: CoreConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ...(coreConfig.includeTestingModule ? [TestingDataModule] : []),
      ], // Add dynamic modules here
    };
  }
}

// ? В Nest есть:
// ? - локальные модули (по умолчанию) = @Module({})
// ? - глобальные модули = @Global()

// ? И дальше провайдеры (for example AppService) кладутся в shared container и любой модуль может их инжектить.

// ? module = единица DI + инкапсуляция через imports / exports = 80% основи по модулях.
