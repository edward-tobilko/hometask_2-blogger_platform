import express, { Express, Request, Response } from "express";

import {
  BLOGS_PATH,
  POSTS_PATH,
  ROOT_PATH,
  TESTING_PATH,
} from "./core/paths/paths";
import { blogsRoute } from "./blogs/routes/blogs.route";
import { HTTP_STATUS_CODES } from "./core/utils/http-status-codes.util";
import { testingRoute } from "./testing/routes/testing.route";
import { postsRoute } from "./posts/routes/posts.route";

export const setupApp = (app: Express) => {
  app.use(express.json());

  app.get(ROOT_PATH, (_req: Request, res: Response) => {
    res.status(HTTP_STATUS_CODES.OK_200).json("Hello back");
  });

  app.use(BLOGS_PATH, blogsRoute);
  app.use(POSTS_PATH, postsRoute);
  app.use(TESTING_PATH, testingRoute);

  return app;
};
