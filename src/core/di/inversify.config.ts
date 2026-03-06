import { Container } from "inversify";

import { IUsersRepository } from "users/interfaces/IUsersRepository";
import { UsersRepository } from "users/repositories/user.repository";
import { IUsersQueryRepository } from "users/interfaces/IUsersQueryRepository";
import { IUsersService } from "users/interfaces/IUsersService";
import { IUsersQueryService } from "users/interfaces/IUsersQueryService";
import { UsersQueryRepository } from "users/repositories/users-query.repository";
import { UsersService } from "users/applications/user.service";
import { UsersQueryService } from "users/applications/users-query.service";
import { IPasswordHasher } from "auth/interfaces/IPasswordHasher";
import { CryptoPasswordHasher } from "auth/adapters/hasher-service.adapter";
import { UsersController } from "users/routes/users-controller";
import { PostsController } from "posts/presentation/controllers/posts.controller";
import { PostsService } from "posts/application/services/posts-service";
import { IPostsService } from "posts/application/interfaces/posts-service.interface";
import { IPostsRepo } from "posts/application/interfaces/posts-repo.interface";
import { PostsRepository } from "posts/infrastructure/repositories/posts.repository";
import { IPostsQueryRepo } from "posts/application/interfaces/posts-query-repo.interface";
import { IPostsQueryService } from "posts/application/interfaces/posts-query-service.interface";
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
import { NodeMailerService } from "auth/adapters/node-mailer-service.adapter";
import { AuthController } from "auth/routes/auth.controller";
import { BlogsController } from "blogs/routes/blogs.controller";
import { CommentsRepository } from "comments/infrastructure/repositories/comments.repository";
import { ICommentsQueryRepo } from "comments/application/interfaces/comments-query-repo.interface";
import { CommentsQueryRepo } from "comments/infrastructure/repositories/comment-query.repository";
import { ICommentsQueryService } from "comments/application/interfaces/comments-query-service.interface";
import { CommentsQueryService } from "comments/application/services/comments-query.service";
import { ICommentsService } from "comments/application/interfaces/comments-service.interface";
import { CommentsService } from "comments/application/services/comments.service";
import { SecurityDevicesController } from "security-devices/routers/security-devices.controller";
import { SecurityDevicesQueryRepo } from "security-devices/repositories/security-devices-query.repo";
import { ISecurityDevicesQueryRepo } from "security-devices/interfaces/ISecurityDevicesQueryRepo";
import { ISecurityDevicesRepo } from "security-devices/interfaces/ISecurityDevicesRepo";
import { SecurityDevicesRepo } from "security-devices/repositories/security-devices.repo";
import { ISecurityDevicesService } from "security-devices/interfaces/ISecurityDevicesService";
import { SecurityDevicesService } from "security-devices/applications/security-devices.service";
import { ISecurityDevicesQueryService } from "security-devices/interfaces/ISecurityDevicesQueryService";
import { SecurityDevicesQueryService } from "security-devices/applications/security-devices-query.service";
import { ICustomRateLimit } from "@core/interfaces/custom-rate-limit.interface";
import { CustomRateLimitRepo } from "@core/infrastructure/repositories/custom-rate-limit.repo";
import { PostQueryService } from "posts/application/services/post-query-service";
import { CommentsController } from "comments/presentation/controllers/comments.controller";
import { DiTypes } from "./types";
import { PostsQueryRepository } from "posts/infrastructure/repositories/post-query.repository";
import { ICommentsRepository } from "comments/application/interfaces/comments-repo.interface";

export const container = new Container({ defaultScope: "Singleton" });

// * Auth model
// Repositories
container
  .bind<ISessionRepository>(DiTypes.ISessionRepository)
  .to(SessionRepository);
container
  .bind<ISessionQueryRepo>(DiTypes.ISessionQueryRepo)
  .to(SessionQueryRepo);

// Services
container.bind<IAuthService>(DiTypes.IAuthService).to(AuthService);

// Other services
container
  .bind<IPasswordHasher>(DiTypes.IPasswordHasher)
  .to(CryptoPasswordHasher);
container.bind<IJWTService>(DiTypes.IJWTService).to(JWTService);
container
  .bind<INodeMailerService>(DiTypes.INodeMailerService)
  .to(NodeMailerService);

// * Blogs model
// Repositories
container
  .bind<IBlogsQueryRepository>(DiTypes.IBlogsQueryRepository)
  .to(BlogsQueryRepository);
container.bind<IBlogsRepository>(DiTypes.IBlogsRepository).to(BlogsRepository);

// Services
container
  .bind<IBlogsQueryService>(DiTypes.IBlogsQueryService)
  .to(BlogsQueryService);
container.bind<IBlogsService>(DiTypes.IBlogsService).to(BlogsService);

// * Comments model
// Repositories
container
  .bind<ICommentsRepository>(DiTypes.ICommentsRepository)
  .to(CommentsRepository);
container
  .bind<ICommentsQueryRepo>(DiTypes.ICommentsQueryRepo)
  .to(CommentsQueryRepo);

// Services
container
  .bind<ICommentsQueryService>(DiTypes.ICommentsQueryService)
  .to(CommentsQueryService);
container.bind<ICommentsService>(DiTypes.ICommentsService).to(CommentsService);

// * Posts model
// Repositories
container.bind<IPostsRepo>(DiTypes.IPostsRepository).to(PostsRepository);
container
  .bind<IPostsQueryRepo>(DiTypes.IPostsQueryRepository)
  .to(PostsQueryRepository);

// Services
container.bind<IPostsService>(DiTypes.IPostsService).to(PostsService);
container
  .bind<IPostsQueryService>(DiTypes.IPostsQueryService)
  .to(PostQueryService);

// * Security Devices model
// Repositories
container
  .bind<ISecurityDevicesQueryRepo>(DiTypes.ISecurityDevicesQueryRepo)
  .to(SecurityDevicesQueryRepo);
container
  .bind<ISecurityDevicesRepo>(DiTypes.ISecurityDevicesRepo)
  .to(SecurityDevicesRepo);

// Services
container
  .bind<ISecurityDevicesService>(DiTypes.ISecurityDevicesService)
  .to(SecurityDevicesService);
container
  .bind<ISecurityDevicesQueryService>(DiTypes.ISecurityDevicesQueryService)
  .to(SecurityDevicesQueryService);

// * Users model
// Repositories
container.bind<IUsersRepository>(DiTypes.IUsersRepository).to(UsersRepository);
container
  .bind<IUsersQueryRepository>(DiTypes.IUsersQueryRepository)
  .to(UsersQueryRepository);

// Services
container.bind<IUsersService>(DiTypes.IUsersService).to(UsersService);
container
  .bind<IUsersQueryService>(DiTypes.IUsersQueryService)
  .to(UsersQueryService);

// * Other
container
  .bind<ICustomRateLimit>(DiTypes.ICustomRateLimitRepo)
  .to(CustomRateLimitRepo);

// * Controllers
container.bind<AuthController>(DiTypes.AuthController).to(AuthController);

container.bind<BlogsController>(DiTypes.BlogsController).to(BlogsController);

container
  .bind<CommentsController>(DiTypes.CommentsController)
  .to(CommentsController);

container.bind<PostsController>(DiTypes.PostsController).to(PostsController);

container
  .bind<SecurityDevicesController>(DiTypes.SecurityDevicesController)
  .to(SecurityDevicesController);

container.bind<UsersController>(DiTypes.UsersController).to(UsersController);

// container.bind<UsersController>(DiTypes.UsersController).to(UsersController).inSingletonScope();

// ? inversify - как бы нашь контейнер (склад), где мы складываем все наши экземпляры (Repo / Service / Controller).

// ? Делаем defaultScope: «Singleton», чтобы не писать .inSingletonScope() везде. Если хочем более точно контролировать lifecycle — убираем defaultScope и ставим scope на каждый bind.
