import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";

export function getPostListByIdBlogHandler(req: Request, res: Response) {
  try {
    res.status(HTTP_STATUS_CODES.OK_200).json({});
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
