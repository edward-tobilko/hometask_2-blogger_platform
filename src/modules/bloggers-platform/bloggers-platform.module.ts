import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Blog, BlogSchema } from './blogs/domain/entities/blog.entity';
import { Post, PostSchema } from './posts/domain/entities/post.entity';
import { SaBlogsController } from './blogs/api/controllers/sa-blogs.controller';
import { PostsController } from './posts/api/controllers/posts.controller';
import { CommentsController } from './comments/api/controllers/comment.controller';
import { BlogsRepository } from './blogs/infrastructure/mongo/repositories/blogs.repository';
// import { BlogsQueryRepository } from './blogs/infrastructure/mongo/repositories/blogs.query-repository';
import { PostsService } from './posts/application/services/posts.service';
import { GetCommentByIdQuery } from './comments/application/queries/comments-query.services';
import { GetPostByIdQueryHandler } from './posts/application/queries/get-post-by-id.query';
import { GetPostsListQueryHandler } from './posts/application/queries/get-posts-list.query';
import { CreateCommentUseCase } from './posts/application/use-cases/create-comment.use-case';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
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
// import { UpdatePostLikeStatusUseCase } from './posts/application/use-cases/update-post-like-status.use-case';
import { GetBlogByIdQueryHandler } from './blogs/application/queries/get-blog.query';
import {
  BlogSubscription,
  BlogSubscriptionSchema,
} from './blogs/domain/entities/blog-subscription.entity';
import { BlogSubscriptionsRepository } from './blogs/infrastructure/mongo/repositories/blog-subscriptions.repository';
import { SubscribeToBlogUseCase } from './blogs/application/use-cases/subscribe-to-blog.use-case';
import { UnsubscribeFromBlogUseCase } from './blogs/application/use-cases/unsubscribe-from-blog.use-case';
// import { GetBlogSubscribersCountHandler } from './blogs/application/queries/get-blog-subscribers-count.query';
import { PostCreatedEventHandler } from './posts/application/event-handlers/post-created.event-handler';
import { GetPostsCountForBlogHandler } from './blogs/application/queries/get-posts-count-for-blog.query';
import { CommentsExternalRepository } from './comments/infrastructure/external-repositories/comments-external.repository';
import { BlogOrmEntity } from './blogs/infrastructure/sql/schemas/blog-orm.entity';
import { BlogsSqlRepository } from './blogs/infrastructure/sql/repositories/blogs-sql.repository';
import { BlogsQuerySqlRepository } from './blogs/infrastructure/sql/repositories/blogs-query-sql.repository';
import { BlogsController } from './blogs/api/controllers/blogs.controller';
import { PostOrmEntity } from './posts/infrastructure/sql/schemas/post-orm.entity';
import { PostsQuerySqlRepository } from './posts/infrastructure/sql/repositories/posts-query-sql.repository';
import { PostsSqlRepository } from './posts/infrastructure/sql/repositories/posts-sql.repository';
import { CommentsSqlQueryRepository } from './comments/infrastructure/sql/repositories/comments-sql-query.repo';
import { CommentsSqlRepository } from './comments/infrastructure/sql/repositories/comments-sql.repo';
import { CommentOrmEntity } from './comments/infrastructure/sql/schemas/comment-orm.entity';
import { GetCommentByPostIdQueryHandler } from './posts/application/queries/get-comment-by-postid.query';

const queryHandlers = [
  // * Blogs contract
  GetBlogsListQueryHandler,
  GetPostsForBlogQueryHandler,
  GetBlogByIdQueryHandler,
  GetPostsCountForBlogHandler,
  // GetBlogSubscribersCountHandler,

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
  SubscribeToBlogUseCase,
  UnsubscribeFromBlogUseCase,

  // * Posts contract
  CreatePostUseCase,
  UpdatePostByIdUseCase,
  DeletePostByIdUseCase,
  CreateCommentUseCase,
  // UpdatePostLikeStatusUseCase,

  // * Comments contract
  UpdateCommentByIdUseCase,
  DeleteCommentByIdUseCase,
  UpdateCommentLikeStatusUseCase,
];

const eventHandlers = [PostCreatedEventHandler];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: BlogSubscription.name, schema: BlogSubscriptionSchema },
      { name: Post.name, schema: PostSchema },
    ]),

    TypeOrmModule.forFeature([BlogOrmEntity, PostOrmEntity, CommentOrmEntity]),

    forwardRef(() => UserAccountsModule), // для решения проблеммы с circular dependency
  ],

  controllers: [
    SaBlogsController,
    BlogsController,
    PostsController,
    CommentsController,
  ],
  providers: [
    ...queryHandlers,
    ...commandHandlers,
    ...eventHandlers,

    BlogsRepository,
    BlogsSqlRepository,

    // BlogsQueryRepository,
    BlogsQuerySqlRepository,

    BlogsExternalQueryRepository,
    BlogSubscriptionsRepository,

    PostsService,

    PostsSqlRepository,
    PostsQuerySqlRepository,

    CommentsSqlQueryRepository,
    CommentsSqlRepository,
    CommentsExternalRepository,
  ],

  exports: [CommentsExternalRepository],
})
export class BloggersPlatformModule {}
