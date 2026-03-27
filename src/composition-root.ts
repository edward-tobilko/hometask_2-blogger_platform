import { DiTypes } from "@core/di/types";
import { AuthController } from "auth/routes/auth.controller";
import { PostsController } from "posts/presentation/controllers/posts.controller";
import { SecurityDevicesController } from "security-devices/routers/security-devices.controller";
import { ICustomRateLimit } from "@core/interfaces/custom-rate-limit.interface";
import { container } from "@core/di/inversify.config";
import { IBlogsQueryService } from "blogs/application/interfaces/blogs-query-service.interface";
import { IJWTService } from "auth/interfaces/IJWTService";
import { CommentsController } from "comments/presentation/controllers/comments.controller";
import { BlogsController } from "blogs/presentation/controllers/blogs.controller";
import { ISessionQueryRepo } from "auth/interfaces/ISessionQueryRepo";
import { UsersController } from "users/presentation/controllers/users-controller";

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
  container.get<ICustomRateLimit>(DiTypes.ICustomRateLimitRepo);

export const getAuthController = () =>
  container.get<AuthController>(DiTypes.AuthController);

export const getBlogsController = () =>
  container.get<BlogsController>(DiTypes.BlogsController);

export const getCommentsController = () =>
  container.get<CommentsController>(DiTypes.CommentsController);

export const getPostsController = () =>
  container.get<PostsController>(DiTypes.PostsController);

export const getSecurityDevicesController = () =>
  container.get<SecurityDevicesController>(DiTypes.SecurityDevicesController);

export const getUsersController = () =>
  container.get<UsersController>(DiTypes.UsersController);

export const getBlogsQueryService = () =>
  container.get<IBlogsQueryService>(DiTypes.IBlogsQueryService);

export const getJwtService = () =>
  container.get<IJWTService>(DiTypes.IJWTService);

export const getSessionQueryRepo = () =>
  container.get<ISessionQueryRepo>(DiTypes.ISessionQueryRepo);

// ? В чем преимущества использования таких getters?:
// ? 1. Упрощение тестирования: можно легко подменить реализацию контроллера на мок или стабы.
// ? 2. Ясность кода: сразу видно, какие зависимости используются в модуле.
// ? 3. Одно место контроля: если мы захотим изменить реализацию контроллера, мы сделаем это в одном месте (кеш, lazy-init, менять scope).
