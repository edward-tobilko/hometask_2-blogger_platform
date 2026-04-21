import { Module } from '@nestjs/common';

import { PostsService } from '../application/services/posts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from '../domain/entities/post.entity';
import { Blog, BlogSchema } from 'src/blogs/domain/entities/blog.entity';
import { PostsRepository } from '../infrastructure/repositories/posts.repository';
import { PostsController } from '../api/controllers/posts.controller';
import { PostsQueryService } from '../application/services/posts-query.service';
import { PostsQueryRepository } from '../infrastructure/repositories/posts-query.repository';
import {
  Comment,
  CommentSchema,
} from 'src/comments/domain/entities/comment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: CommentSchema },
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
