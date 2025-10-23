import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { postsService } from "../../application/posts-service";
import { RepositoryNotFoundError } from "../../../core/errors/repository-not-found.error";

export async function deletePostHandler(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id;

    await postsService.deletePost(id);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundError) {
      return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);
    }
    return next(error);
  }
}
