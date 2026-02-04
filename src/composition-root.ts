import { container } from "@core/di/inversify.config";
import { Types } from "@core/di/types";
import { ICustomRateLimitRepo } from "@core/interfaces/ICustomRateLimitRepo";
import { AuthController } from "auth/routes/auth.controller";
import { BlogsQueryService } from "blogs/application/blog-query.service";
import { BlogsQueryRepository } from "blogs/repositories/blog-query.repository";
import { BlogsController } from "blogs/routes/blogs.controller";
import { CommentsController } from "comments/routes/comments.controller";
import { PostsController } from "posts/routes/posts.controller";
import { SecurityDevicesController } from "security-devices/routers/security-devices.controller";
import { UsersController } from "users/routes/users-controller";

// * Blogs
const blogsQueryRepository = new BlogsQueryRepository();
export const blogsQueryService = new BlogsQueryService(blogsQueryRepository);

// * Other
export const customRateLimitRepo = container.get<ICustomRateLimitRepo>(
  Types.ICustomRateLimitRepo
);

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
