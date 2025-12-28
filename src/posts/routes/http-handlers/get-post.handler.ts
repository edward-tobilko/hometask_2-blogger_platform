import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { postQueryService } from "../../application/post-query-service";
import { errorsHandler } from "../../../core/errors/errors-handler.error";

export async function getPostHandler(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const postDb = await postQueryService.getPostById(req.params.id);

    res.status(HTTP_STATUS_CODES.OK_200).json(postDb);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
