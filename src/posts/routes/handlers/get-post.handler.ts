import { NextFunction, Request, Response } from "express";
import { log } from "node:console";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { postsService } from "../../application/posts-service";
import { mapToPostOutputUtil } from "../mappers/map-to-post-output.util";
import { RepositoryNotFoundError } from "../../../core/errors/repository-not-found.error";

export async function getPostHandler(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const postDb = await postsService.getPostById(req.params.id);

    log("Get post by ID ->", mapToPostOutputUtil(postDb));

    res.status(HTTP_STATUS_CODES.OK_200).json(mapToPostOutputUtil(postDb));
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundError) {
      return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);
    }
    return next(error);
  }
}
