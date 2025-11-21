import { NextFunction, Request, Response } from "express";
import { log } from "console";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { blogsService } from "../../application/blogs-service";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { CreatePostForBlogRequestPayload } from "../../../posts/routes/request-payloads/create-post.request-payload";
import { CreatePostForBlogDtoCommand } from "../../../posts/application/commands/post-dto-type.commands";

export async function createPostForBlogHandler(
  req: Request<{ id: string }, {}, CreatePostForBlogRequestPayload, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const command = createCommand<CreatePostForBlogDtoCommand>({
      ...req.body,
      blogId: req.params.id,
    });

    const createdPostForBlogOutput =
      await blogsService.createPostForBlog(command);

    log("New post for blog ->", createdPostForBlogOutput.data);

    res
      .status(HTTP_STATUS_CODES.CREATED_201)
      .json(createdPostForBlogOutput.data);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);

    next(error);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
