import { Request, Response, Router } from "express";

import { db } from "../../db/mock.db";
import { HTTP_STATUS_CODES } from "../../core/utils/http-statuses.util";

export const postsRouter = Router({});

postsRouter.get("", (_req: Request, res: Response) => {
  const posts = db.posts;

  res.status(HTTP_STATUS_CODES.OK_200).json(posts);
});
