import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";

import { testingRoute } from "./testing/routes/testing.route";
import { createPostsRouter } from "./posts/routes/posts.route";
import { routersPaths } from "./core/paths/paths";
import { createAuthRouter } from "./auth/routes/auth.route";
import { blogsRoute } from "./blogs/routes/blogs.route";
import { commentsRoute } from "./comments/routes/comments.route";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { securityDevicesRouter } from "security-devices/routers/security-devices.router";
import { CustomRateLimitRepo } from "@core/repositories/custom-rate-limit.repo";
import { customRateLimitCollection } from "db/mongo.db";
import { container } from "@core/di/inversify.config";
import { Types } from "@core/di/types";
import { UsersController } from "users/routes/users-controller";
import { createUsersRouter } from "users/routes/users.route";
import { PostsController } from "posts/routes/posts.controller";

export const setupApp = (app: Express) => {
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1); // for prod
  } else {
    app.set("trust proxy", false); // for dev/test
  }

  app.use(express.json());
  app.use(cookieParser());

  const customRateLimitRepo = new CustomRateLimitRepo(
    customRateLimitCollection
  );

  // * Root router
  app.get(routersPaths.root, (_req: Request, res: Response) => {
    res.status(HTTP_STATUS_CODES.OK_200).json("Hello User");
  });

  // * Auth router
  app.use(routersPaths.auth, createAuthRouter(customRateLimitRepo));

  // * Blog router
  app.use(routersPaths.blogs, blogsRoute);

  // * Comments router
  app.use(routersPaths.comments, commentsRoute);

  // * Posts router
  const postsController = container.get<PostsController>(Types.PostsController);
  app.use(routersPaths.posts, createPostsRouter(postsController));

  // * Security devices router
  app.use(routersPaths.securityDevices, securityDevicesRouter);

  // * Users router
  const usersController = container.get<UsersController>(Types.UsersController);

  app.use(routersPaths.users, createUsersRouter(usersController));

  // * Testing router
  app.use(routersPaths.testing, testingRoute);

  return app;
};
