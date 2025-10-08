import { Request, Response } from "express";

import { BlogInputDto } from "../../types/blog.types";
import { blogsRepository } from "../../repositories/blogs.repository";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import {
  ErrorMessages,
  errorMessagesUtil,
} from "../../../core/utils/error-messages.util";

export async function updateBlogHandler(
  req: Request<{ id: string }, {}, BlogInputDto>,
  res: Response<{ errorsMessages: ErrorMessages[] }>
) {
  try {
    const blogDb = await blogsRepository.findBlogById(req.params.id);

    if (!blogDb) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json(
        errorMessagesUtil([
          {
            message: `Blog with id=${req.params.id} is not found`,
            field: "id",
          },
        ])
      );
    }

    await blogsRepository.updateBlog(req.params.id, req.body);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
