import express, { Express, Request, Response } from "express";

import { blogsRoute } from "./blogs/routes/blogs.route";
import { HTTP_STATUS_CODES } from "./core/utils/http-status-codes.util";
import { testingRoute } from "./testing/routes/testing.route";
import { postsRoute } from "./posts/routes/posts.route";
import { usersRoute } from "./users/routes/users.route";
import { routersPaths } from "./core/paths/paths";

export const setupApp = (app: Express) => {
  app.use(express.json());

  app.get(routersPaths.root, (_req: Request, res: Response) => {
    res.status(HTTP_STATUS_CODES.OK_200).json("Hello User");
  });

  app.use(routersPaths.blogs, blogsRoute);
  app.use(routersPaths.posts, postsRoute);
  app.use(routersPaths.users, usersRoute);

  app.use(routersPaths.testing, testingRoute);

  // * для отлова путей
  app.use((req, _res, next) => {
    console.log("REQUEST:", req.method, req.url);

    next();
  });

  return app;
};
