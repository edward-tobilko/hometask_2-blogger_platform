import { Collection } from "mongodb";

import { container } from "@core/di/inversify.config";
import { Types } from "@core/di/types";
import { AuthController } from "auth/routes/auth.controller";
import { BlogsQueryRepository } from "blogs/repositories/blog-query.repository";
import { BlogsController } from "blogs/routes/blogs.controller";
import { CommentsController } from "comments/routes/comments.controller";
import { customRateLimitCollection } from "db/mongo.db";
import { CustomRateLimitDB } from "db/types.db";
import { PostsController } from "posts/routes/posts.controller";
import { SecurityDevicesController } from "security-devices/routers/security-devices.controller";
import { UsersController } from "users/routes/users-controller";
import { IBlogsQueryRepository } from "blogs/interfaces/IBlogsQueryRepository";
import { IBlogsQueryService } from "blogs/interfaces/IBlogsQueryService";
import { BlogsQueryService } from "blogs/application/blog-query.service";
import { ICustomRateLimitRepo } from "@core/interfaces/ICustomRateLimitRepo";

let inited = false;

export const initCompositionRoot = () => {
  if (inited) return;

  inited = true;

  // * биндим коллекцию ПОСЛЕ runDB(), когда она уже инициализирована
  if (!customRateLimitCollection) {
    throw new Error(
      "customRateLimitCollection is not initialized. Call runDB() first."
    );
  }

  if (container.isBound(Types.CustomRateLimitCollection)) {
    container.unbind(Types.CustomRateLimitCollection);
  }

  container
    .bind<Collection<CustomRateLimitDB>>(Types.CustomRateLimitCollection)
    .toConstantValue(customRateLimitCollection);
};

// * Blogs
if (!container.isBound(Types.IBlogsQueryRepository)) {
  container
    .bind<IBlogsQueryRepository>(Types.IBlogsQueryRepository)
    .to(BlogsQueryRepository);
}

if (!container.isBound(Types.IBlogsQueryService)) {
  container
    .bind<IBlogsQueryService>(Types.IBlogsQueryService)
    .to(BlogsQueryService);
}

// * Controllers
export const authController = container.get<AuthController>(
  Types.AuthController
);

export const blogsController = container.get<BlogsController>(
  Types.BlogsController
);

export const commentsController = container.get<CommentsController>(
  Types.CommentsController
);

export const postsController = container.get<PostsController>(
  Types.PostsController
);

export const securityDevicesController =
  container.get<SecurityDevicesController>(Types.SecurityDevicesController);

export const usersController = container.get<UsersController>(
  Types.UsersController
);

// * getters
export const getCustomRateLimitRepo = () =>
  container.get<ICustomRateLimitRepo>(Types.ICustomRateLimitRepo);
