import { Request, Response } from "express";

import { blogsRepository } from "../../repositories/blogs.repository";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { BlogView } from "../../types/blog.types";
import { mapToBlogViewModelUtil } from "../mappers/map-to-blog-view-model.util";

export async function getBlogListHandler(
  _req: Request,
  res: Response<BlogView[]>
) {
  try {
    const blogsDb = await blogsRepository.findAllBlogs();

    const blogsView = blogsDb.map(mapToBlogViewModelUtil);

    res.status(HTTP_STATUS_CODES.OK_200).json(blogsView);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
