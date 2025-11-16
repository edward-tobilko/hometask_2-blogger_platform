import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { blogsService } from "../../application/blogs-service";
import { mapToBlogOutputUtil } from "../../application/mappers/map-to-blog-output.mapper";
import { RepositoryNotFoundError } from "../../../core/errors/repository-not-found.error";

export async function getBlogByIdHandler(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id;

    const blogDbByIdOutput = await blogsService.findBlogById(id);

    const mappedBlogByIdOutput = mapToBlogOutputUtil(blogDbByIdOutput);

    res.status(HTTP_STATUS_CODES.OK_200).json(mappedBlogByIdOutput);
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundError) {
      return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);
    }

    return next();
  }
}
