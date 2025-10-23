import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { PostInputDtoModel } from "../../types/post.types";
import { blogsService } from "../../../blogs/application/blogs-service";
import { postsService } from "../../application/posts-service";
import { mapToPostOutputUtil } from "../mappers/map-to-post-output.util";
import { RepositoryNotFoundError } from "../../../core/errors/repository-not-found.error";

export async function createNewPostHandler(
  req: Request<{}, {}, PostInputDtoModel>,
  res: Response,
  next: NextFunction
) {
  try {
    const { title, shortDescription, content, blogId } = req.body;

    const blogDbResponse = await blogsService.findBlogById(blogId);

    const postOutputResponse = await postsService.createPost(
      {
        title,
        shortDescription,
        content,
        blogId,
      },
      blogDbResponse.name
    );

    res
      .status(HTTP_STATUS_CODES.CREATED_201)
      .json(mapToPostOutputUtil(postOutputResponse));
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundError) {
      return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);
    }
    return next(error);
  }
}
