import { Request, Response } from "express";

import {
  ErrorMessages,
  errorMessagesUtil,
} from "./../../../core/utils/error-messages.util";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { blogsRepository } from "../../repositories/blogs.repository";

export async function deleteBlogHandler(
  req: Request<{ id: string }>,
  res: Response<{ errorMessages: ErrorMessages[] }>
) {
  try {
    const blogDb = await blogsRepository.findBlogById(req.params.id);

    if (!blogDb) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json(
        errorMessagesUtil([
          {
            field: "id",
            message: `Blog with id=${req.params.id} is not found`,
          },
        ])
      );
    }

    await blogsRepository.deleteBlog(req.params.id);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
