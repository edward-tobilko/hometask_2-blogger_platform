import { Request, Response } from "express";
import { matchedData } from "express-validator";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { postsService } from "../../application/posts-service";
import { UpdatePostRequestPayload } from "../request-payloads/update-post.request-payload";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { UpdatePostDtoCommand } from "../../application/commands/post-dto-type.commands";
import { errorsHandler } from "../../../core/errors/errors-handler.error";

export async function updatePostHandler(
  req: Request<{ id: string }, {}, UpdatePostRequestPayload, {}>,
  res: Response
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
    errorsHandler(error, req, res);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
