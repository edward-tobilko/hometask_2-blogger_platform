import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { BlogInputDtoModel, BlogViewModel } from "../../types/blog.types";
import { blogsService } from "../../application/blogs-service";
import { mapToBlogOutputUtil } from "../mappers/map-to-blog-output.util";
import { RepositoryNotFoundError } from "../../../core/errors/repository-not-found.error";

export async function createNewBlogHandler(
  req: Request<{}, {}, BlogInputDtoModel>,
  res: Response<BlogViewModel>,
  next: NextFunction
) {
  try {
    const { name, description, websiteUrl } = req.body;

    const createdNewBlog = await blogsService.createBlog({
      name,
      description,
      websiteUrl,
    });

    const blogOutput = mapToBlogOutputUtil(createdNewBlog);

    res.status(HTTP_STATUS_CODES.CREATED_201).json(blogOutput);
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundError) {
      return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);
    }
    return next(error);
  }
}
