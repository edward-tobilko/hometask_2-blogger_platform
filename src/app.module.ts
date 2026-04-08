import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsModule } from './blogs/blogs.module';

@Module({
  // * imports - целые модули — уже собранные блоки с контроллерами, сервисами внутри
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}.local`, // чтобы автоматически подхватывался нужный файл (development / test / production)
      isGlobal: true, // чтобы не импортировать ConfigModule в каждый модуль (добавляет модуль в глобальный scope DI). Но!!! Не уго стоит использовать только для инфраструктурных модулей — ConfigModule, LoggerModule, возможно DatabaseModule. Для бизнес-модулей (BlogsModule, PostsModule) — никогда, потому что это ломает инкапсуляцию и понимание связей между модулями.
    }),

    BlogsModule,
  ],

  controllers: [AppController],

  // * providers - отдельные классы — сервисы, репозитории, гарды и тд...
  providers: [AppService],
})
export class AppModule {}

// ? В Nest есть:
// ? - локальные модули (по умолчанию) = @Module({})
// ? - глобальные модули = @Global()

// ? И дальше провайдеры (for example AppService) кладутся в shared container и любой модуль может их инжектить.
