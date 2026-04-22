import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogSchema } from './blogs/domain/entities/blog.entity';
import { Post, PostSchema } from './posts/domain/entities/post.entity';
import {
  Comment,
  CommentSchema,
} from './comments/domain/entities/comment.entity';
import { BlogsController } from './blogs/api/controllers/blogs.controller';
import { PostsController } from './posts/api/controllers/posts.controller';
import { CommentController } from './comments/api/controllers/comment.controller';
import { BlogsService } from './blogs/application/services/blogs.service';
import { BlogsQueryService } from './blogs/application/services/blogs.query-service';
import { BlogsRepository } from './blogs/infrastructure/repositories/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/repositories/blogs.query-repository';
import { PostsService } from './posts/application/services/posts.service';
import { PostsRepository } from './posts/infrastructure/repositories/posts.repository';
import { PostsQueryService } from './posts/application/services/posts-query.service';
import { PostsQueryRepository } from './posts/infrastructure/repositories/posts-query.repository';
import { CommentsQueryService } from './comments/application/services/comments-query.services';
import { CommentsQueryRepository } from './comments/infrastructure/repositories/comments-query.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],

  controllers: [BlogsController, PostsController, CommentController],
  providers: [
    BlogsService,
    BlogsQueryService,
    BlogsRepository,
    BlogsQueryRepository,

    PostsService,
    PostsQueryService,
    PostsRepository,
    PostsQueryRepository,

    CommentsQueryService,
    CommentsQueryRepository,
  ],
})
export class BloggersPlatformModule {}
