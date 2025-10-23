import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { BlogInputDtoModel } from "../../types/blog.types";
import { blogsService } from "../../application/blogs-service";
import { RepositoryNotFoundError } from "../../../core/errors/repository-not-found.error";

export async function updateBlogHandler(
  req: Request<{ id: string }, {}, BlogInputDtoModel>,
  res: Response,
  next: NextFunction
) {
  try {
    const updatedBlog = await blogsService.updateBlog(req.params.id, req.body);

    if (!updatedBlog) return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundError) {
      return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);
    }
    return next(error);
  }
}
