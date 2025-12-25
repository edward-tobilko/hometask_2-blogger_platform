import { Request, Response } from "express";

import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";

export const deleteCommentHandler = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const commentId = req.params.id;

    res.status(HTTP_STATUS_CODES.OK_200).json("lol");
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};
