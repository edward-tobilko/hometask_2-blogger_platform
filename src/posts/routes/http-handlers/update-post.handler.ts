import { Request, Response } from "express";
import { matchedData } from "express-validator";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { postsService } from "../../application/posts-service";
import { UpdatePostRP } from "../request-payload-types/update-post.request-payload-types";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { UpdatePostDtoCommand } from "../../application/commands/update-post-dto.command";
import { mapApplicationStatusToHttpStatus } from "@core/result/map-app-status-to-http.result";

export async function updatePostHandler(
  req: Request<{ id: string }, {}, UpdatePostRP, {}>,
  res: Response
) {
  try {
    const sanitizedBody = matchedData<UpdatePostRP>(req, {
      locations: ["body"],
      includeOptionals: true,
    });

    const command = createCommand<UpdatePostDtoCommand>({
      id: req.params.id,
      ...sanitizedBody,
    });

    const result = await postsService.updatePost(command);

    if (!result.isSuccess()) {
      return res
        .status(mapApplicationStatusToHttpStatus(result.status))
        .json({ errorsMessages: result.extensions });
    }

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
