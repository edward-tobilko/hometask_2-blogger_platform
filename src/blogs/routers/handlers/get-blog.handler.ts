import { Request, Response } from "express";

import { BlogView } from "../../types/blog.types";
import { blogsRepository } from "../../repositories/blogs.repository";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import {
  ErrorMessages,
  errorMessagesUtil,
} from "../../../core/utils/error-messages.util";
import { mapToBlogViewModelUtil } from "../mappers/map-to-blog-view-model.util";

export async function getBlogByIdHandler(
  req: Request<{ id: string }>,
  res: Response<BlogView | { errorsMessages: ErrorMessages[] }>
) {
  try {
    const id = req.params.id;

    const currentBlogDb = await blogsRepository.findBlogById(id);

    if (!currentBlogDb) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND_404)
        .json(
          errorMessagesUtil([
            { field: "id", message: `Blog with id=${id} is not found` },
          ])
        );
    }

    const currentBlogViewResponse = mapToBlogViewModelUtil(currentBlogDb);

    res.status(HTTP_STATUS_CODES.OK_200).json(currentBlogViewResponse);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
