import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { blogsService } from "../../application/blogs-service";
import { RepositoryNotFoundError } from "../../../core/errors/repository-not-found.error";

export async function deleteBlogHandler(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    await blogsService.deleteBlog(req.params.id);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundError) {
      return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);
    }
    return next(error);
  }
}
