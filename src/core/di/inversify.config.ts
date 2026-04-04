import { Container } from "inversify";

import { IUsersRepository } from "@users/application/interfaces/users-repo.interface";
import { IUsersQueryRepository } from "@users/application/interfaces/users-query-repo.interface";
import { IUsersService } from "@users/application/interfaces/users-service.interface";
import { IUsersQueryService } from "@users/application/interfaces/users-query-service.interface";
import { UsersService } from "@users/application/services/user.service";
import { IPasswordHasher } from "@auth/application/interfaces/password-hasher.interface";
import { CryptoPasswordHasher } from "@auth/infrastructure/external-api/password-hasher";
import { PostsController } from "@posts/presentation/controllers/posts.controller";
import { PostsService } from "@posts/application/services/posts-service";
import { IPostsService } from "@posts/application/interfaces/posts-service.interface";
import { IPostsRepo } from "@posts/application/interfaces/posts-repo.interface";
import { PostsRepository } from "@posts/infrastructure/repositories/posts.repository";
import { IPostsQueryRepo } from "@posts/application/interfaces/posts-query-repo.interface";
import { IPostsQueryService } from "@posts/application/interfaces/posts-query-service.interface";
import { IBlogsQueryRepository } from "@blogs/application/interfaces/blogs-query-repo.interface";
import { BlogsQueryRepository } from "@blogs/infrastructure/repositories/blog-query.repository";
import { BlogsRepository } from "@blogs/infrastructure/repositories/blogs.repository";
import { IBlogsRepository } from "@blogs/application/interfaces/blogs-repo.interface";
import { IBlogsQueryService } from "@blogs/application/interfaces/blogs-query-service.interface";
import { BlogsQueryService } from "@blogs/application/services/blog-query.service";
import { IBlogsService } from "@blogs/application/interfaces/blogs-service.interface";
import { BlogsService } from "@blogs/application/services/blogs-service";
import { ISessionRepository } from "@auth/application/interfaces/session-repo.interface";
import { SessionRepository } from "@auth/infrastructure/repositories/session.repository";
import { SessionQueryRepo } from "@auth/infrastructure/repositories/session-query.repo";
import { ISessionQueryRepo } from "@auth/application/interfaces/session-query-repo.interface";
import { IAuthService } from "@auth/application/interfaces/auth-service.interface";
import { IJWTService } from "@auth/application/interfaces/jwt-service.interface";
import { JWTService } from "@auth/application/services/jwt-service.adapter";
import { INodeMailerService } from "@auth/application/interfaces/node-mailer-service.interface";
import { NodeMailerService } from "@auth/infrastructure/external-api/node-mailer-service";
import { AuthController } from "@auth/presentation/controllers/auth.controller";
import { CommentsRepository } from "@comments/infrastructure/repositories/comments.repository";
import { ICommentsQueryRepo } from "@comments/application/interfaces/comments-query-repo.interface";
import { CommentsQueryRepo } from "@comments/infrastructure/repositories/comment-query.repository";
import { ICommentsQueryService } from "@comments/application/interfaces/comments-query-service.interface";
import { CommentsQueryService } from "@comments/application/services/comments-query.service";
import { ICommentsService } from "@comments/application/interfaces/comments-service.interface";
import { CommentsService } from "@comments/application/services/comments.service";
import { SecurityDevicesController } from "@security-devices/presentation/controllers/security-devices.controller";
import { SecurityDevicesQueryRepo } from "@security-devices/infrastructure/repositories/security-devices-query.repo";
import { ISecurityDevicesQueryRepo } from "@security-devices/applications/interfaces/security-devices-query-repo.interface";
import { ISecurityDevicesRepo } from "@security-devices/applications/interfaces/security-devices-repo.interface";
import { SecurityDevicesRepo } from "@security-devices/infrastructure/repositories/security-devices.repo";
import { ISecurityDevicesService } from "@security-devices/applications/interfaces/security-devices-service.interface";
import { SecurityDevicesService } from "@security-devices/applications/services/security-devices.service";
import { ISecurityDevicesQueryService } from "@security-devices/applications/interfaces/security-devices-query-service.interface";
import { SecurityDevicesQueryService } from "@security-devices/applications/services/security-devices-query.service";
import { ICustomRateLimit } from "@core/interfaces/custom-rate-limit.interface";
import { CustomRateLimitRepo } from "@core/infrastructure/repositories/custom-rate-limit.repo";
import { PostQueryService } from "@posts/application/services/post-query-service";
import { CommentsController } from "@comments/presentation/controllers/comments.controller";
import { DiTypes } from "./types";
import { PostsQueryRepository } from "@posts/infrastructure/repositories/posts-query.repository";
import { ICommentsRepository } from "@comments/application/interfaces/comments-repo.interface";
import { BlogsController } from "@blogs/presentation/controllers/blogs.controller";
import { UsersQueryService } from "@users/application/services/users-query.service";
import { UsersRepository } from "@users/infrastructure/repositories/user.repository";
import { UsersQueryRepository } from "@users/infrastructure/repositories/users-query.repository";
import { UsersController } from "@users/presentation/controllers/users-controller";
import { AuthService } from "@auth/application/services/session.service";

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
