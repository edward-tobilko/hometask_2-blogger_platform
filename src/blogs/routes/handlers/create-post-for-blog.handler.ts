import { Request, Response } from "express";
import { log } from "console";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import {
  PostInputDtoModel,
  PostViewModel,
} from "../../../posts/types/post.types";
import { blogsService } from "../../application/blogs-service";

export async function createPostForBlogHandler(
  req: Request<{ id: string }, {}, PostInputDtoModel, {}>,
  res: Response<PostViewModel>
) {
  try {
    const blogId = req.params.id;
    const dto = req.body;

    const createdNewPostForBlogResult = await blogsService.createPostForBlog(
      blogId,
      dto
    );

    log("new blog ->", createdNewPostForBlogResult);

    res.status(HTTP_STATUS_CODES.CREATED_201).json(createdNewPostForBlogResult);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
