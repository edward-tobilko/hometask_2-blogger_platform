import express, { Express, Request, Response } from "express";

import {
  BLOGS_PATH,
  POSTS_PATH,
  ROOT_PATH,
  TESTING_PATH,
} from "./core/paths/paths";
import { blogsRouter } from "./blogs/routers/blogs.router";
import { HTTP_STATUS_CODES } from "./core/utils/http-statuses.util";
import { postsRouter } from "./posts/routers/posts.router";

export const setupApp = (app: Express) => {
  app.use(express.json());

  app.get(ROOT_PATH, (_req: Request, res: Response) => {
    res.status(HTTP_STATUS_CODES.OK_200).json("Hello back");
  });

  app.use(BLOGS_PATH, blogsRouter);
  app.use(POSTS_PATH, postsRouter);

  app.delete(TESTING_PATH, (_req: Request, res: Response) => {
    db.blogs = [];
    db.posts = [];

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  });

  return app;
};
