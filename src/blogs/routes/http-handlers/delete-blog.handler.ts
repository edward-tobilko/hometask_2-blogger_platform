import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { blogsService } from "../../application/blogs-service";
import { createCommand } from "../../../core/helpers/create-command.helper";

export async function deleteBlogHandler(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const command = createCommand({
      id: req.params.id,
    });

    await blogsService.deleteBlog(command);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);

    next(error);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
