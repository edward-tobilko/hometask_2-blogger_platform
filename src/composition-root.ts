import { container } from "@core/di/inversify.config";
import { Types } from "@core/di/types";
import { ICustomRateLimitRepo } from "@core/interfaces/ICustomRateLimitRepo";
import { AuthController } from "auth/routes/auth.controller";
import { BlogsController } from "blogs/routes/blogs.controller";
import { PostsController } from "posts/routes/posts.controller";
import { UsersController } from "users/routes/users-controller";

export const authController = container.get<AuthController>(
  Types.AuthController
);
export const blogsController = container.get<BlogsController>(
  Types.BlogsController
);
export const postsController = container.get<PostsController>(
  Types.PostsController
);
export const usersController = container.get<UsersController>(
  Types.UsersController
);
export const customRateLimitRepo = container.get<ICustomRateLimitRepo>(
  Types.ICustomRateLimitRepo
);
