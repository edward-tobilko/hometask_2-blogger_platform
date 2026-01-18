import { Request, Response } from "express";
import { matchedData } from "express-validator";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { commentsService } from "../../application/comments.service";
import { UpdateCommentRP } from "../request-payload-types/update-comment.request-payload-types";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { UpdateCommentDtoCommand } from "comments/application/commands/update-comment-dto.command";
import { mapApplicationStatusToHttpStatus } from "@core/result/map-app-status-to-http.result";

export const updateCommentHandler = async (
  req: Request<{ commentId: string }, {}, UpdateCommentRP, {}>,
  res: Response
) => {
  const userId = req.user.id; // from express.d.ts (именно через middleware jwtAuthGuard мы пропускаем правильного юзера с токеном).

  const sanitizedBody = matchedData<UpdateCommentRP>(req, {
    locations: ["body"],
    includeOptionals: false,
  });

  const command = createCommand<UpdateCommentDtoCommand>({
    commentId: req.params.commentId,
    ...sanitizedBody,
  });

  const commentRes = await commentsService.updateComment(command, userId);

  if (!commentRes.isSuccess()) {
    return res
      .status(mapApplicationStatusToHttpStatus(commentRes.status))
      .json({ errorsMessages: commentRes.extensions });
  }

  res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
};

// ? Request<Params, ResBody, ReqBody, Query>
// ? Можно убрать try/catch, потому что Service (CommentsService) не выдает ошибки, а возвращает ApplicationResult.
