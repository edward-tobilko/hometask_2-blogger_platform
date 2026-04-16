import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlogsController } from './api/blogs.controller';
import { BlogsQueryService } from './application/blogs.query-service';
import { Blog, BlogSchema } from './domain/blog.entity';
import { BlogsQueryRepository } from './infrastructure/blogs.query-repository';
import { BlogsService } from './application/blogs.service';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),

    PostsModule,
  ],
  controllers: [BlogsController],
  providers: [
    BlogsService,
    BlogsQueryService,
    BlogsQueryRepository,
    BlogsRepository,
  ],

  exports: [BlogsQueryRepository], // тут указываем какие провайдеры будут доступны в другом модуле в случае импорта "видны снаружи"
})
export class BlogsModule {}

// ? providers без exports — это private провайдеры, видимые только внутри своего модуля.

// ? метод forFeature - регистрирует модель "Blog" -> принимает массив объектов { name, schema } -> регистрирует в DI-контейнере модель Mongoose для каждой схемы -> делает эту модель доступной для инжекта только внутри BlogsModule (и всего, что его импортирует).
