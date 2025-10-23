import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { PostInputDtoModel } from "../../types/post.types";
import { postsService } from "../../application/posts-service";
import { blogsService } from "../../../blogs/application/blogs-service";
import { RepositoryNotFoundError } from "../../../core/errors/repository-not-found.error";

export async function updatePostHandler(
  req: Request<{ id: string }, {}, PostInputDtoModel, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const dto: PostInputDtoModel = req.body;

    const blog = await blogsService.findBlogById(dto.blogId);

    const updatedPost = await postsService.updatePost(id, dto, blog.name);

    if (!updatedPost) return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundError) {
      return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);
    }
    return next(error);
  }
}
