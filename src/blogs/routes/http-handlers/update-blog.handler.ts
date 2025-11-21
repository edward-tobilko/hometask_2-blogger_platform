import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { blogsService } from "../../application/blogs-service";
import { UpdateBlogRequestPayload } from "../request-payloads/update-blog.request-payload";
import { createCommand } from "../../../core/helpers/create-command.helper";

export async function updateBlogHandler(
  req: Request<{ id: string }, {}, UpdateBlogRequestPayload, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const payload: UpdateBlogRequestPayload = req.body;

    const command = createCommand({
      ...payload,
      id: req.params.id,
    });

    await blogsService.updateBlog(command);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);

    next(error);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
