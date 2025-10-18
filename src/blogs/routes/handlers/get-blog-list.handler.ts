import { Request, Response } from "express";

import { blogsRepository } from "../../repositories/blogs.repository";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { BlogViewModel } from "../../types/blog.types";
import { mapToBlogViewModelUtil } from "../mappers/map-to-blog-view-model.util";
import { blogsService } from "../../application/blogs-service";

export async function getBlogListHandler(
  req: Request,
  res: Response<BlogViewModel[]>
) {
  try {
    const blogsDb = await blogsService.findAllBlogs(req.params);

    const blogsView = blogsDb.items.map(mapToBlogViewModelUtil);

    res.status(HTTP_STATUS_CODES.OK_200).json(blogsView);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
