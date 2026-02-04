import { Container } from "inversify";
import { Collection } from "mongodb";

import { Types } from "./types";
import { IUsersRepository } from "users/interfaces/IUsersRepository";
import { UsersRepository } from "users/repositories/user.repository";
import { IUsersQueryRepository } from "users/interfaces/IUsersQueryRepository";
import { IUsersService } from "users/interfaces/IUsersService";
import { IUsersQueryService } from "users/interfaces/IUsersQueryService";
import { UsersQueryRepository } from "users/repositories/users-query.repository";
import { UsersService } from "users/applications/user.service";
import { UsersQueryService } from "users/applications/users-query.service";
import { IPasswordHasher } from "auth/interfaces/IPasswordHasher";
import { CryptoPasswordHasher } from "auth/adapters/crypto-hasher-service.adapter";
import { UsersController } from "users/routes/users-controller";
import { PostsController } from "posts/routes/posts.controller";
import { PostsService } from "posts/application/posts-service";
import { IPostsService } from "posts/interfaces/IPostsService";
import { IPostsRepository } from "posts/interfaces/IPostsRepository";
import { PostsRepository } from "posts/repositories/posts.repository";
import { PostsQueryRepository } from "posts/repositories/post-query.repository";
import { IPostsQueryRepository } from "posts/interfaces/IPostsQueryRepository";
import { IPostsQueryService } from "posts/interfaces/IPostsQueryService";
import { PostQueryService } from "posts/application/post-query-service";
import { IBlogsQueryRepository } from "blogs/interfaces/IBlogsQueryRepository";
import { BlogsQueryRepository } from "blogs/repositories/blog-query.repository";
import { BlogsRepository } from "blogs/repositories/blogs.repository";
import { IBlogsRepository } from "blogs/interfaces/IBlogsRepository";
import { IBlogsQueryService } from "blogs/interfaces/IBlogsQueryService";
import { BlogsQueryService } from "blogs/application/blog-query.service";
import { IBlogsService } from "blogs/interfaces/IBlogsService";
import { BlogsService } from "blogs/application/blogs-service";
import { ISessionRepository } from "auth/interfaces/ISessionRepository";
import { SessionRepository } from "auth/repositories/session.repository";
import { SessionQueryRepo } from "auth/repositories/session-query.repo";
import { ISessionQueryRepo } from "auth/interfaces/ISessionQueryRepo";
import { AuthService } from "auth/application/session.service";
import { IAuthService } from "auth/interfaces/IAuthService";
import { IJWTService } from "auth/interfaces/IJWTService";
import { JWTService } from "auth/adapters/jwt-service.adapter";
import { INodeMailerService } from "auth/interfaces/INodeMailerService";
import { NodeMailerService } from "auth/adapters/nodemailer-service.adapter";
import { AuthController } from "auth/routes/auth.controller";
import { BlogsController } from "blogs/routes/blogs.controller";
import { ICustomRateLimitRepo } from "@core/interfaces/ICustomRateLimitRepo";
import { CustomRateLimitRepo } from "@core/repositories/custom-rate-limit.repo";
import { CustomRateLimitDB } from "db/types.db";
import { customRateLimitCollection } from "db/mongo.db";
import { ICommentsRepository } from "comments/interfaces/ICommentsRepository";
import { CommentsRepository } from "comments/repositories/comments.repository";
import { ICommentsQueryRepo } from "comments/interfaces/ICommentsQueryRepo";
import { CommentsQueryRepo } from "comments/repositories/comment-query.repository";
import { ICommentsQueryService } from "comments/interfaces/ICommentsQueryService";
import { CommentsQueryService } from "comments/application/comments-query.service";
import { ICommentsService } from "comments/interfaces/ICommentsService";
import { CommentsService } from "comments/application/comments.service";
import { CommentsController } from "comments/routes/comments.controller";
import { SecurityDevicesController } from "security-devices/routers/security-devices.controller";

export const container = new Container({ defaultScope: "Singleton" });

// * Users
// Repositories
container.bind<IUsersRepository>(Types.IUsersRepository).to(UsersRepository);
container
  .bind<IUsersQueryRepository>(Types.IUsersQueryRepository)
  .to(UsersQueryRepository);

// Services
container.bind<IUsersService>(Types.IUsersService).to(UsersService);
container
  .bind<IUsersQueryService>(Types.IUsersQueryService)
  .to(UsersQueryService);

// * Auth
// Repositories
container
  .bind<ISessionRepository>(Types.ISessionRepository)
  .to(SessionRepository);
container.bind<ISessionQueryRepo>(Types.ISessionQueryRepo).to(SessionQueryRepo);

// Services
container.bind<IAuthService>(Types.IAuthService).to(AuthService);

// Other
container.bind<IPasswordHasher>(Types.IPasswordHasher).to(CryptoPasswordHasher);
container.bind<IJWTService>(Types.IJWTService).to(JWTService);
container
  .bind<INodeMailerService>(Types.INodeMailerService)
  .to(NodeMailerService);

// * Posts
// Repositories
container.bind<IPostsRepository>(Types.IPostsRepository).to(PostsRepository);
container
  .bind<IPostsQueryRepository>(Types.IPostsQueryRepository)
  .to(PostsQueryRepository);

// Services
container.bind<IPostsService>(Types.IPostsService).to(PostsService);
container
  .bind<IPostsQueryService>(Types.IPostsQueryService)
  .to(PostQueryService);

// * Blogs
// Repositories
container
  .bind<IBlogsQueryRepository>(Types.IBlogsQueryRepository)
  .to(BlogsQueryRepository);
container.bind<IBlogsRepository>(Types.IBlogsRepository).to(BlogsRepository);

// Services
container
  .bind<IBlogsQueryService>(Types.IBlogsQueryService)
  .to(BlogsQueryService);
container.bind<IBlogsService>(Types.IBlogsService).to(BlogsService);

// * Comments
// Repositories
container
  .bind<ICommentsRepository>(Types.ICommentsRepository)
  .to(CommentsRepository);
container
  .bind<ICommentsQueryRepo>(Types.ICommentsQueryRepo)
  .to(CommentsQueryRepo);

// Services
container
  .bind<ICommentsQueryService>(Types.ICommentsQueryService)
  .to(CommentsQueryService);
container.bind<ICommentsService>(Types.ICommentsService).to(CommentsService);

// * Other
container
  .bind<ICustomRateLimitRepo>(Types.ICustomRateLimitRepo)
  .to(CustomRateLimitRepo);
container
  .bind<Collection<CustomRateLimitDB>>(Types.CustomRateLimitCollection)
  .toConstantValue(customRateLimitCollection); // customRateLimitCollection from mondo.db.ts

// * CONTROLLERS
container.bind<AuthController>(Types.AuthController).to(AuthController);
container.bind<BlogsController>(Types.BlogsController).to(BlogsController);
container
  .bind<CommentsController>(Types.CommentsController)
  .to(CommentsController);
container.bind<PostsController>(Types.PostsController).to(PostsController);
container
  .bind<SecurityDevicesController>(Types.SecurityDevicesController)
  .to(SecurityDevicesController);
container.bind<UsersController>(Types.UsersController).to(UsersController);
// container.bind<UsersController>(Types.UsersController).to(UsersController).inSingletonScope();

// ? Делаем defaultScope: «Singleton», чтобы не писать .inSingletonScope() везде. Если хочем более точно контролировать lifecycle — убираем defaultScope и ставим scope на каждый bind.
