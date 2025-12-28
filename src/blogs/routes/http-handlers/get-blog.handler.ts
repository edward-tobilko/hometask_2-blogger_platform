import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { blogsQueryService } from "../../application/blog-query.service";
import { RepositoryNotFoundError } from "../../../core/errors/application.error";

export async function getBlogByIdHandler(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const id = req.params.id;

    const blogOutput = await blogsQueryService.getBlogById(id);

    res.status(HTTP_STATUS_CODES.OK_200).json(blogOutput);
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundError) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json({
        errorsMessages: [{ message: (error as Error).message, field: "id" }], // получаем ошибку "Blog is not exist!"" из репозитория findBlogByIdQueryRepo -> throw new RepositoryNotFoundError("Blog is not exist!");
      });
    }

    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
      errorsMessages: [{ message: "Internal Server Error", field: "id" }],
    });
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
