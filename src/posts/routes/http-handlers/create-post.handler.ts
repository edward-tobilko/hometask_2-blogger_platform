import { NextFunction, Request, Response } from "express";
import { matchedData } from "express-validator";
import { log } from "node:console";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { postsService } from "../../application/posts-service";
import { CreatePostRP } from "../request-payload-types/create-post.request-payload-types";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { CreatePostDtoCommand } from "../../application/commands/create-post-dto.command";

export async function createPostHandler(
  req: Request<{}, {}, CreatePostRP, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const sanitizedBodyParam = matchedData<CreatePostRP>(req, {
      locations: ["body"],
      includeOptionals: true,
    });

    const command = createCommand<CreatePostDtoCommand>(sanitizedBodyParam);

    const postOutput = await postsService.createPost(command);

    log(postOutput.data);

    res.status(HTTP_STATUS_CODES.CREATED_201).json(postOutput.data);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);

    next(error);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
