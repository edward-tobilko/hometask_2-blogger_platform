import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { postsService } from "../../application/posts-service";
import { errorsHandler } from "../../../core/errors/errors-handler.error";

export async function deletePostHandler(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const id = req.params.id;

    await postsService.deletePost(id);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
