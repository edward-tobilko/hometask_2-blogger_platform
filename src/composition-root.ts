import { Collection } from "mongodb";

import { Types } from "@core/di/types";
import { AuthController } from "auth/routes/auth.controller";
import { BlogsController } from "blogs/routes/blogs.controller";
import { CommentsController } from "comments/routes/comments.controller";
import { customRateLimitCollection } from "db/mongo.db";
import { CustomRateLimitDB } from "db/types.db";
import { PostsController } from "posts/routes/posts.controller";
import { SecurityDevicesController } from "security-devices/routers/security-devices.controller";
import { UsersController } from "users/routes/users-controller";
import { ICustomRateLimitRepo } from "@core/interfaces/ICustomRateLimitRepo";
import { container } from "@core/di/inversify.config";
import { IBlogsQueryService } from "blogs/interfaces/IBlogsQueryService";
import { IJWTService } from "auth/interfaces/IJWTService";

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

// * Getters
export const getCustomRateLimitRepo = () =>
  container.get<ICustomRateLimitRepo>(Types.ICustomRateLimitRepo);

export const getAuthController = () =>
  container.get<AuthController>(Types.AuthController);

export const getBlogsController = () =>
  container.get<BlogsController>(Types.BlogsController);

export const getCommentsController = () =>
  container.get<CommentsController>(Types.CommentsController);

export const getPostsController = () =>
  container.get<PostsController>(Types.PostsController);

export const getSecurityDevicesController = () =>
  container.get<SecurityDevicesController>(Types.SecurityDevicesController);

export const getUsersController = () =>
  container.get<UsersController>(Types.UsersController);

export const getBlogsQueryService = () =>
  container.get<IBlogsQueryService>(Types.IBlogsQueryService);

export const getJwtService = () =>
  container.get<IJWTService>(Types.IJWTService);

// ? В чем преимущества использования таких getters?:
// ? 1. Упрощение тестирования: можно легко подменить реализацию контроллера на мок или стабы.
// ? 2. Ясность кода: сразу видно, какие зависимости используются в модуле.
// ? 3. Одно место контроля: если мы захотим изменить реализацию контроллера, мы сделаем это в одном месте (кеш, lazy-init, менять scope).
