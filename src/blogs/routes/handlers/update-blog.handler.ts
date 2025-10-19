import { Request, Response } from "express";

import { blogsRepository } from "../../repositories/blogs.repository";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";

export async function updateBlogHandler(
  req: Request<{ id: string }, {}, BlogInputDto>,
  res: Response
) {
  try {
    const blogDb = await blogsRepository.findBlogById(req.params.id);

    await blogsRepository.updateBlog(req.params.id, req.body);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
