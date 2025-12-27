import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { blogsService } from "../../application/blogs-service";
import { UpdateBlogRP } from "../request-payload-types/update-blog.request-payload";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { RepositoryNotFoundError } from "../../../core/errors/application.error";

export async function updateBlogHandler(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const payload: UpdateBlogRP = req.body;

    const command = createCommand({
      id: req.params.id,
      ...payload,
    });

    await blogsService.updateBlog(command);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundError) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json({
        errorsMessages: [{ message: (error as Error).message, field: "id" }], // получаем ошибку "Blog is not exist!"" из репозитория saveBlogRepo -> throw new RepositoryNotFoundError("Blog is not exist!");
      });
    }

    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
      errorsMessages: [{ message: "Internal Server Error", field: "id" }],
    });
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
