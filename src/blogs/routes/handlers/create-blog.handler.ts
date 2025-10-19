import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { blogsRepository } from "../../repositories/blogs.repository";
import { BlogInputDtoModel, BlogViewModel } from "../../types/blog.types";
import { blogsService } from "../../application/blogs-service";
import { mapToBlogOutputUtil } from "../mappers/map-to-blog-output.util";

export async function createNewBlogHandler(
  req: Request<{}, {}, BlogInputDtoModel>,
  res: Response<BlogViewModel>
) {
  try {
    const createdNewBlog = await blogsService.createNewBlog(req.body);

    const blogOutput = mapToBlogOutputUtil(createdNewBlog);

    res.status(HTTP_STATUS_CODES.CREATED_201).json(blogOutput);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
