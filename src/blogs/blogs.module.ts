import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlogsController } from './blogs.controller';
import { BlogsQueryService } from './blogs.query-service';
import { Blog, BlogSchema } from './schemas/blogs.schema';
import { BlogsQueryRepository } from './blogs.query-repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  controllers: [BlogsController],
  providers: [BlogsQueryService, BlogsQueryRepository],

  //   exports: [BlogsService], // тут указываем какие провайдеры будут доступны в другом модуле в случае импорта "видны снаружи"
})
export class BlogsModule {}

// ? providers без exports — это private провайдеры, видимые только внутри своего модуля.

// ? метод forFeature - регистрирует модель "Blog" -> принимает массив объектов { name, schema } -> регистрирует в DI-контейнере модель Mongoose для каждой схемы -> делает эту модель доступной для инжекта только внутри BlogsModule (и всего, что его импортирует).
