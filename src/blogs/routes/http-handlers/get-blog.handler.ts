import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { RepositoryNotFoundError } from "../../../core/errors/repository-not-found.error";
import { blogsQueryService } from "../../application/blog-query.service";

export async function getBlogByIdHandler(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id;

    const blogOutput = await blogsQueryService.getBlogById(id);

    res.status(HTTP_STATUS_CODES.OK_200).json(blogOutput);
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundError) {
      return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);
    }

    return next();
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
