import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { postsService } from "../../application/posts-service";

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
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);

    next(error);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
