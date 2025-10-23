import { NextFunction, Request, Response } from "express";
import { log } from "console";
import { ObjectId } from "mongodb";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import {
  PostInputDtoModel,
  PostViewModel,
} from "../../../posts/types/post.types";
import { blogsService } from "../../application/blogs-service";
import { RepositoryNotFoundError } from "../../../core/errors/repository-not-found.error";

export async function createPostForBlogHandler(
  req: Request<{ id: string }, {}, PostInputDtoModel, {}>,
  res: Response<PostViewModel>,
  next: NextFunction
) {
  try {
    const blogId = req.params.id;
    const dto = req.body;

    if (!ObjectId.isValid(blogId))
      return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);

    const blog = await blogsService.findBlogById(blogId);

    if (!blog) return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);

    const createdNewPostForBlogResult = await blogsService.createPostForBlog(
      blogId,
      dto
    );

    log("new blog ->", createdNewPostForBlogResult);

    res.status(HTTP_STATUS_CODES.CREATED_201).json(createdNewPostForBlogResult);
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundError)
      return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);

    return next(error);
  }
}
