import { Container } from "inversify";

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
import { BcryptPasswordHasher } from "auth/adapters/bcrypt-hasher-service.adapter";
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

export const container = new Container({ defaultScope: "Singleton" });

// * Users
container.bind<IUsersRepository>(Types.IUsersRepository).to(UsersRepository);
container
  .bind<IUsersQueryRepository>(Types.IUsersQueryRepository)
  .to(UsersQueryRepository);
container.bind<IUsersService>(Types.IUsersService).to(UsersService);
container
  .bind<IUsersQueryService>(Types.IUsersQueryService)
  .to(UsersQueryService);

// * Auth
container.bind<IPasswordHasher>(Types.IPasswordHasher).to(BcryptPasswordHasher);

// * Posts
container.bind<IPostsService>(Types.IPostsService).to(PostsService);
container
  .bind<IPostsQueryService>(Types.IPostsQueryService)
  .to(PostQueryService);
container.bind<IPostsRepository>(Types.IPostsRepository).to(PostsRepository);
container
  .bind<IPostsQueryRepository>(Types.IPostsQueryRepository)
  .to(PostsQueryRepository);

// * CONTROLLERS
container.bind<UsersController>(Types.UsersController).to(UsersController);
// container.bind<UsersController>(Types.UsersController).to(UsersController).inSingletonScope();
container.bind<PostsController>(Types.PostsController).to(PostsController);

// ? Делаем defaultScope: «Singleton», чтобы не писать .inSingletonScope() везде. Если хочем более точно контролировать lifecycle — убираем defaultScope и ставим scope на каждый bind.
