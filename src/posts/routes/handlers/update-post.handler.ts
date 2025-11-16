import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { PostInputDtoModel } from "../../types/post.types";
import { postsService } from "../../application/posts-service";
import { blogsService } from "../../../blogs/application/blogs-service";

export async function updatePostHandler(
  req: Request<{ id: string }, {}, PostInputDtoModel, {}>,
  res: Response
) {
  try {
    const { id } = req.params;
    const dto: PostInputDtoModel = req.body;

    const blog = await blogsService.findBlogById(dto.blogId);

    await postsService.updatePost(id, dto, blog.name);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
