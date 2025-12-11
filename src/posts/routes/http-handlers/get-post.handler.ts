import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { RepositoryNotFoundError } from "../../../core/errors/repository-not-found.error";
import { postQueryService } from "../../application/post-query-service";

export async function getPostHandler(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const postDb = await postQueryService.getPostById(req.params.id);

    res.status(HTTP_STATUS_CODES.OK_200).json(postDb);
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundError) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json({
        errorsMessages: [{ message: (error as Error).message, field: "id" }],
      });
    }

    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
      errorsMessages: [{ message: "Internal Server Error", field: "id" }],
    });
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
