import { Request, Response } from "express";

import { BlogInputDto, BlogView } from "../../types/blog.types";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { blogsRepository } from "../../repositories/blogs.repository";
import { mapToBlogViewModelUtil } from "../mappers/map-to-blog-view-model.util";

export async function createNewBlogHandler(
  req: Request<{}, {}, BlogInputDto>,
  res: Response<BlogView>
) {
  try {
    const createdNewBlog = await blogsRepository.createNewBlog(req.body);

    const blogViewResponse = mapToBlogViewModelUtil(createdNewBlog);

    res.status(HTTP_STATUS_CODES.CREATED_201).json(blogViewResponse);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
