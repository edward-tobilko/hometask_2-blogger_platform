import { NextFunction, Request, Response } from "express";
import { matchedData } from "express-validator";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { postsService } from "../../application/posts-service";
import { UpdatePostRequestPayload } from "../request-payloads/update-post.request-payload";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { UpdatePostDtoCommand } from "../../application/commands/post-dto-type.commands";

export async function updatePostHandler(
  req: Request<{ id: string }, {}, UpdatePostRequestPayload, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const sanitizedBody = matchedData<UpdatePostRequestPayload>(req, {
      locations: ["body"],
      includeOptionals: true,
    });

    const command = createCommand<UpdatePostDtoCommand>({
      id: req.params.id,
      ...sanitizedBody,
    });

    await postsService.updatePost(command);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);

    next(error);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
