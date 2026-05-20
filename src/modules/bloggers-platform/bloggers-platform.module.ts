import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

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
import { BlogsRepository } from './blogs/infrastructure/repositories/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/repositories/blogs.query-repository';
import { PostsService } from './posts/application/services/posts.service';
import { PostsRepository } from './posts/infrastructure/repositories/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/repositories/posts-query.repository';
import { GetCommentByIdQuery } from './comments/application/queries/comments-query.services';
import { CommentsQueryRepository } from './comments/infrastructure/repositories/comments-query.repository';
import { GetPostByIdQueryHandler } from './posts/application/queries/get-post-by-id.query';
import { GetPostsListQueryHandler } from './posts/application/queries/get-posts-list.query';
import { GetCommentByPostIdQueryHandler } from './posts/application/queries/get-comment-by-postid.query';
import { CreateCommentUseCase } from './posts/application/use-cases/create-comment.use-case';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CommentsRepository } from './comments/infrastructure/repositories/comments.repo';
import { BlogsExternalQueryRepository } from './blogs/infrastructure/external-query/blogs.external-query-repo';
import { CreatePostUseCase } from './posts/application/use-cases/create-post.use-case';
import { UpdatePostByIdUseCase } from './posts/application/use-cases/update-post.use-case';
import { DeletePostByIdUseCase } from './posts/application/use-cases/delete-post.use-case';
import { GetBlogsListQueryHandler } from './blogs/application/queries/get-blogs-list.query';
import { GetPostsForBlogQueryHandler } from './blogs/application/queries/get-posts-for-blog.query';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog.use-case';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog.use-case';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog.use-case';
import { UpdateCommentByIdUseCase } from './comments/application/use-cases/update-comment.use-case';
import { DeleteCommentByIdUseCase } from './comments/application/use-cases/delete-comment.use-case';
import { UpdateCommentLikeStatusUseCase } from './comments/application/use-cases/update-comment-like-status.use-case';
import { UpdatePostLikeStatusUseCase } from './posts/application/use-cases/update-post-like-status.use-case';

const queryHandlers = [
  // * Blogs contract
  GetBlogsListQueryHandler,
  GetPostsForBlogQueryHandler,

  // * Posts contract
  GetPostByIdQueryHandler,
  GetPostsListQueryHandler,
  GetCommentByPostIdQueryHandler,

  // * Comments contract
  GetCommentByIdQuery,
];

const commandHandlers = [
  // * Blogs contract
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,

  // * Posts contract
  CreatePostUseCase,
  UpdatePostByIdUseCase,
  DeletePostByIdUseCase,
  CreateCommentUseCase,
  UpdatePostLikeStatusUseCase,

  // * Comments contract
  UpdateCommentByIdUseCase,
  DeleteCommentByIdUseCase,
  UpdateCommentLikeStatusUseCase,
];

@Module({
  imports: [
    CqrsModule,

    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),

    UserAccountsModule,
  ],

  controllers: [BlogsController, PostsController, CommentController],
  providers: [
    ...queryHandlers,
    ...commandHandlers,

    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    BlogsExternalQueryRepository,

    PostsService,
    PostsRepository,
    PostsQueryRepository,

    CommentsQueryRepository,
    CommentsRepository,
  ],
})
export class BloggersPlatformModule {}
