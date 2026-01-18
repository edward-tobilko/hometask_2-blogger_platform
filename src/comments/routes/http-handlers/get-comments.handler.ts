import { Request, Response } from "express";

import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { commentsQueryService } from "../../application/comments-query.service";
import { mapApplicationStatusToHttpStatus } from "@core/result/map-app-status-to-http.result";

export const getCommentsHandler = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const commentId = req.params.id;

    const commentOutput = await commentsQueryService.getCommentsById(commentId);

    if (!commentOutput.isSuccess()) {
      return res
        .status(mapApplicationStatusToHttpStatus(commentOutput.status))
        .json({ errorsMessages: commentOutput.extensions });
    }

    res.status(HTTP_STATUS_CODES.OK_200).json(commentOutput.data);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
