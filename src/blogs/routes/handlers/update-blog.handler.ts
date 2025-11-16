import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { BlogInputDtoModel } from "../../types/blog.types";
import { blogsService } from "../../application/blogs-service";

export async function updateBlogHandler(
  req: Request<{ id: string }, {}, BlogInputDtoModel>,
  res: Response
) {
  try {
    await blogsService.updateBlog(req.params.id, req.body);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
