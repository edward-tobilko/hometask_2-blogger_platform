import { NextFunction, Request, Response } from "express";
import { matchedData } from "express-validator";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { postsService } from "../../application/posts-service";
import { CreatePostRequestPayload } from "../request-payloads/create-post.request-payload";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { CreatePostDtoCommand } from "../../application/commands/post-dto-type.commands";

export async function createPostHandler(
  req: Request<{}, {}, CreatePostRequestPayload, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const sanitizedBodyParam = matchedData<CreatePostRequestPayload>(req, {
      locations: ["body"],
      includeOptionals: true,
    });

    const command = createCommand<CreatePostDtoCommand>(sanitizedBodyParam);

    const postOutput = await postsService.createPost(command);

    res.status(HTTP_STATUS_CODES.CREATED_201).json(postOutput.data);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);

    next(error);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
