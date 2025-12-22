import { Request, Response } from "express";
import { log } from "console";
import { ObjectId } from "mongodb";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { blogsService } from "../../application/blogs-service";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { CreatePostForBlogRequestPayload } from "../../../posts/routes/request-payloads/create-post-for-blog.request-payload";
import { CreatePostForBlogDtoCommand } from "../../../posts/application/commands/post-dto-type.commands";
import { RepositoryNotFoundError } from "../../../core/errors/application.error";

export async function createPostForBlogHandler(
  req: Request<{ id: string }, {}, CreatePostForBlogRequestPayload, {}>,
  res: Response
) {
  try {
    const id = req.params.id;

    console.log("HANDLER PARAMS:", req.params.id); // if id = 1 -> error

    if (!ObjectId.isValid(id)) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST_400).json({
        errorsMessages: [
          { message: "Incorrect format of ObjectId", field: "id" },
        ],
      });
    }

    const command = createCommand<CreatePostForBlogDtoCommand>({
      ...req.body,
      blogId: id,
    });

    const createdPostForBlogOutput =
      await blogsService.createPostForBlog(command);

    log("New post for blog ->", createdPostForBlogOutput.data);

    res
      .status(HTTP_STATUS_CODES.CREATED_201)
      .json(createdPostForBlogOutput.data);
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundError) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json({
        errorsMessages: [{ message: (error as Error).message, field: "id" }],
      });
    }

    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
      errorsMessages: [{ message: "Internal Server Error", field: "id" }],
    });
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
