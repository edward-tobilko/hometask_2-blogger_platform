import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { RepositoryNotFoundError } from "../../../core/errors/repository-not-found.error";
import { postQueryService } from "../../application/post-query-service";

export async function getPostHandler(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const postDb = await postQueryService.getPostById(req.params.id);

    res.status(HTTP_STATUS_CODES.OK_200).json(postDb);
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundError) {
      return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);
    }

    return next(error);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
