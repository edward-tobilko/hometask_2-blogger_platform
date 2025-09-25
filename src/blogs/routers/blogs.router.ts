import { Router, Request, Response } from "express";

import { db } from "../../db/mock.db";
import { HTTP_STATUS_CODES } from "../../core/utils/http-statuses.util";
import { errorMessages } from "../../core/utils/error-messages.util";

export const blogsRouter = Router({});

blogsRouter.get("", (_req: Request, res: Response) => {
  const blogs = db.blogs;

  res.status(HTTP_STATUS_CODES.OK_200).json(blogs);
});

blogsRouter.get("/:id", (req: Request<{ id: string }>, res: Response) => {
  const currentBlog = db.blogs.find((blog) => blog.id === req.params.id);

  if (!currentBlog) {
    return res
      .status(HTTP_STATUS_CODES.NOT_FOUND_404)
      .json(errorMessages([{ field: "id", message: "Blog not found" }]));
  }

  res.status(HTTP_STATUS_CODES.OK_200).json(currentBlog);
});

blogsRouter.post("", (req: Request<{ id: string }>, res: Response) => {});
