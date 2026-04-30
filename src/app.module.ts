import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestingDataModule } from './testing/testing-data.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { CoreModule } from './core/core.module';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';

@Module({
  // * классы-модули — уже собранные блоки с controllers / providers (какие другие модули нам нужны)
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV ?? 'development'}.local`, // чтобы автоматически подхватывался нужный файл (development / test / production).

      isGlobal: true, // что бы не импортировать ConfigModule в каждый модуль (добавляет модуль в глобальный scope DI). Но!!! Не уго стоит использовать только для инфраструктурных модулей — ConfigModule, LoggerModule, возможно DatabaseModule. Для бизнес-модулей (BlogsModule, PostsModule) — никогда, потому что это ломает инкапсуляцию и понимание связей между модулями.
    }),

    // MongooseModule.forRoot('mongodb://localhost/nest'), // forRoot - синхронный метод (для простых кейсов, без настройки путей)

    MongooseModule.forRootAsync({
      inject: [ConfigService], // говорим, что нам нужен ConfigService (он может валидировать переменные через Joi-схему, и если MONGO_URL пустой, приложение упадёт на старте, а не при первом запросе).

      // * паттерн (хук) который возвращает конфигурационный объект для модуля. Nest вызовет её один раз при старте приложения
      useFactory: (config: ConfigService) => ({
        uri: config.get('MONGO_URL'),
        dbName: config.get('DB_NAME'),
      }),
    }),

    // * ограничение количества запросов с одного IP (Максимум 10 запросов за 60 секунд с одного IP).
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000,
          limit: 5,
        },
      ],
    }),

    // * импортируем модули, что бы переиспользовать их провайдеры (из массива exports)
    BloggersPlatformModule,
    UserAccountsModule,

    TestingDataModule,
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
export class AppModule {}

// ? В Nest есть:
// ? - локальные модули (по умолчанию) = @Module({})
// ? - глобальные модули = @Global()

// ? И дальше провайдеры (for example AppService) кладутся в shared container и любой модуль может их инжектить.

// ? module = единица DI + инкапсуляция через imports / exports = 80% основи по модулях.
