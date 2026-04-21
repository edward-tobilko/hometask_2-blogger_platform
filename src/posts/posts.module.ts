import { Module } from '@nestjs/common';

import { PostsService } from './application/services/posts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './domain/post.entity';
import { Blog, BlogSchema } from 'src/blogs/domain/blog.entity';
import { PostsRepository } from './infrastructure/repositories/posts.repository';
import { PostsController } from './api/controllers/posts.controller';
import { PostsQueryService } from './application/services/posts-query.service';
import { PostsQueryRepository } from './infrastructure/repositories/posts-query.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Blog.name, schema: BlogSchema },
    ]),
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsQueryService,
    PostsRepository,
    PostsQueryRepository,
  ],
  exports: [PostsService, PostsRepository], // что бы BlogsController мог создавать посты
})
export class PostsModule {}
