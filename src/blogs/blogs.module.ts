import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogSchema } from './domain/blog.entity';
import { PostsModule } from 'src/posts/posts.module';
import { Post, PostSchema } from 'src/posts/domain/post.entity';
import { BlogsController } from './api/controllers/blogs.controller';
import { BlogsQueryService } from './application/services/blogs.query-service';
import { BlogsService } from './application/services/blogs.service';
import { BlogsQueryRepository } from './infrastructure/repositories/blogs.query-repository';
import { BlogsRepository } from './infrastructure/repositories/blogs.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
    ]),

    PostsModule,
  ],
  controllers: [BlogsController],
  providers: [
    BlogsService,
    BlogsQueryService,
    BlogsQueryRepository,
    BlogsRepository,
  ],

  exports: [BlogsQueryRepository], // указываем какие провайдеры будут доступны в другом модуле в случае импорта "видны снаружи"
})
export class BlogsModule {}

// ? providers без exports — это private провайдеры, видимые только внутри своего модуля.

// ? метод forFeature - регистрирует модель "Blog" -> принимает массив объектов { name, schema } -> регистрирует в DI-контейнере модель Mongoose для каждой схемы -> делает эту модель доступной для инжекта только внутри BlogsModule (и всего, что его импортирует).
