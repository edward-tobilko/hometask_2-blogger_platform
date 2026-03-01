import { Types } from "@core/di/types";
import { AuthController } from "auth/routes/auth.controller";
import { BlogsController } from "blogs/routes/blogs.controller";
import { PostsController } from "posts/routes/posts.controller";
import { SecurityDevicesController } from "security-devices/routers/security-devices.controller";
import { UsersController } from "users/routes/users-controller";
import { ICustomRateLimitRepo } from "@core/interfaces/ICustomRateLimitRepo";
import { container } from "@core/di/inversify.config";
import { IBlogsQueryService } from "blogs/interfaces/IBlogsQueryService";
import { IJWTService } from "auth/interfaces/IJWTService";
import { CommentsController } from "comments/controllers/comments.controller";

let inited = false;

export const initCompositionRoot = () => {
  if (inited) return;

  inited = true;
};

export const resetCompositionRootForTests = () => {
  inited = false;
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
