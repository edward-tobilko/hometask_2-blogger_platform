import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsModule } from './blogs/blogs.module';

@Module({
  // * классы-модули — уже собранные блоки с controllers / providers (какие другие модули нам нужны)
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}.local`, // чтобы автоматически подхватывался нужный файл (development / test / production)
      isGlobal: true, // чтобы не импортировать ConfigModule в каждый модуль (добавляет модуль в глобальный scope DI). Но!!! Не уго стоит использовать только для инфраструктурных модулей — ConfigModule, LoggerModule, возможно DatabaseModule. Для бизнес-модулей (BlogsModule, PostsModule) — никогда, потому что это ломает инкапсуляцию и понимание связей между модулями.
    }),

    BlogsModule, // импортируем весь модуль, не а не только, например, сервис
  ],

  // * обработчики HTTP-запросов (они инжектятся в DI, но не "используются" другими классами — они точка входа HTTP-запросов)
  controllers: [AppController],

  // * отдельные классы — сервисы, репозитории, гарды и тд... (все что инжектиться). Это то, что Nest регистрирует в DI-контейнере модуля и умеет инжектить через конструктор.
  providers: [AppService],

  // * что из providers мы "разрешаем использовать" другим модулям (инкапсуляция)
  exports: [],
})
export class AppModule {}

// ? В Nest есть:
// ? - локальные модули (по умолчанию) = @Module({})
// ? - глобальные модули = @Global()

// ? И дальше провайдеры (for example AppService) кладутся в shared container и любой модуль может их инжектить.

// ? module = единица DI + инкапсуляция через imports / exports = 80% основи по модулях.
