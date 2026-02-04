import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";

import { testingRoute } from "./testing/routes/testing.route";
import { createPostsRouter } from "./posts/routes/posts.route";
import { routersPaths } from "./core/paths/paths";
import { createAuthRouter } from "./auth/routes/auth.route";
import { commentsRoute } from "./comments/routes/comments.route";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { securityDevicesRouter } from "security-devices/routers/security-devices.router";
import { createUsersRouter } from "users/routes/users.route";
import { createBlogsRouter } from "blogs/routes/blogs.route";
import {
  authController,
  blogsController,
  customRateLimitRepo,
  postsController,
  usersController,
} from "composition-root";

export const setupApp = (app: Express) => {
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1); // for prod
  } else {
    app.set("trust proxy", false); // for dev/test
  }

  app.use(express.json());
  app.use(cookieParser());

  // * Root router
  app.get(routersPaths.root, (_req: Request, res: Response) => {
    res.status(HTTP_STATUS_CODES.OK_200).json("Hello User");
  });

  // * Auth router
  app.use(
    routersPaths.auth,
    createAuthRouter(customRateLimitRepo, authController)
  );

  // * Blogs router
  app.use(routersPaths.blogs, createBlogsRouter(blogsController));

  // * Comments router
  app.use(routersPaths.comments, commentsRoute);

  // * Posts router
  app.use(routersPaths.posts, createPostsRouter(postsController));

  // * Security devices router
  app.use(routersPaths.securityDevices, securityDevicesRouter);

  // * Users router
  app.use(routersPaths.users, createUsersRouter(usersController));

  // * Testing router
  app.use(routersPaths.testing, testingRoute);

  return app;
};

// ? DI → Composition root → App → Router

//  ? Inversify
//  ?    ↓
//  ? container.get()
//  ?    ↓
//  ? composition-root.ts
//  ?    ↓
//  ? app.ts
//  ?    ↓
//  ? createAuthRouter(...)
//  ?    ↓
//  ? authController.method()
