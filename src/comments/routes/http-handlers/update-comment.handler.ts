import { Request, Response } from "express";
import { matchedData } from "express-validator";

import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { commentsService } from "../../application/comments.service";
import { UpdateCommentRP } from "../request-payload-types/update-comment.request-payload-types";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { UpdateCommentDtoCommand } from "comments/application/commands/update-comment-dto.command";

export const updateCommentHandler = async (
  req: Request<{ commentId: string }, {}, UpdateCommentRP, {}>,
  res: Response
) => {
  try {
    const userId = req.user.id; // from express.d.ts (именно через middleware jwtAuthGuard мы пропускаем правильного юзера с токеном).

    const sanitizedBody = matchedData<UpdateCommentRP>(req, {
      locations: ["body"],
      includeOptionals: false,
    });

    const command = createCommand<UpdateCommentDtoCommand>({
      commentId: req.params.commentId,
      ...sanitizedBody,
    });

    await commentsService.updateComment(command, userId);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
