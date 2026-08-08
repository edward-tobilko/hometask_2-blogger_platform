import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogSchema } from './blogs/domain/entities/blog.entity';
import { Post, PostSchema } from './posts/domain/entities/post.entity';
import {
  Comment,
  CommentSchema,
} from './comments/domain/entities/comment.entity';
import { BlogsController } from './blogs/api/controllers/blogs.controller';
import { PostsController } from './posts/api/controllers/posts.controller';
import { CommentsController } from './comments/api/controllers/comment.controller';
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
import { GetBlogByIdQueryHandler } from './blogs/application/queries/get-blog.query';
import {
  BlogSubscription,
  BlogSubscriptionSchema,
} from './blogs/domain/entities/blog-subscription.entity';
import { BlogSubscriptionsRepository } from './blogs/infrastructure/repositories/blog-subscriptions.repository';
import { SubscribeToBlogUseCase } from './blogs/application/use-cases/subscribe-to-blog.use-case';
import { UnsubscribeFromBlogUseCase } from './blogs/application/use-cases/unsubscribe-from-blog.use-case';
import { GetBlogSubscribersCountHandler } from './blogs/application/queries/get-blog-subscribers-count.query';
import { PostCreatedEventHandler } from './posts/application/event-handlers/post-created.event-handler';
import { GetPostsCountForBlogHandler } from './blogs/application/queries/get-posts-count-for-blog.query';
import { CommentsExternalRepository } from './comments/infrastructure/external-repositories/comments-external.repository';

const queryHandlers = [
  // * Blogs contract
  GetBlogsListQueryHandler,
  GetPostsForBlogQueryHandler,
  GetBlogByIdQueryHandler,
  GetPostsCountForBlogHandler,
  GetBlogSubscribersCountHandler,

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
  UpdatePostLikeStatusUseCase,

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
      { name: Comment.name, schema: CommentSchema },
    ]),

    forwardRef(() => UserAccountsModule), // для решения проблеммы с circular dependency
  ],

  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    ...queryHandlers,
    ...commandHandlers,
    ...eventHandlers,

    BlogsRepository,
    BlogsQueryRepository,
    BlogsExternalQueryRepository,
    BlogSubscriptionsRepository,

    PostsService,
    PostsRepository,
    PostsQueryRepository,

    CommentsQueryRepository,
    CommentsRepository,
    CommentsExternalRepository,
  ],

  exports: [CommentsExternalRepository],
})
export class BloggersPlatformModule {}
