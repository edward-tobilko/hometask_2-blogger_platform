import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";

import { testingRoute } from "./testing/routes/testing.route";
import { postsRoute } from "./posts/routes/posts.route";
import { usersRoute } from "./users/routes/users.route";
import { routersPaths } from "./core/paths/paths";
import { authRoute } from "./auth/routes/auth.route";
import { blogsRoute } from "./blogs/routes/blogs.route";
import { commentsRoute } from "./comments/routes/comments.route";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

export const setupApp = (app: Express) => {
  app.set("trust proxy", 1);

  app.use(express.json());
  app.use(cookieParser());

  // * Root
  app.get(routersPaths.root, (_req: Request, res: Response) => {
    res.status(HTTP_STATUS_CODES.OK_200).json("Hello User");
  });

  // * Routers
  app.use(routersPaths.auth, authRoute);
  app.use(routersPaths.blogs, blogsRoute);
  app.use(routersPaths.posts, postsRoute);
  app.use(routersPaths.users, usersRoute);
  app.use(routersPaths.comments, commentsRoute);

  // * Testing router
  app.use(routersPaths.testing, testingRoute);

  return app;
};
