import { Request, Response } from "express";

import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { commentsQueryService } from "../../application/comments-query.service";

export const getCommentsHandler = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const commentId = req.params.id;

    const commentOutput = await commentsQueryService.getCommentsById(commentId);

    res.status(HTTP_STATUS_CODES.OK_200).json(commentOutput);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
