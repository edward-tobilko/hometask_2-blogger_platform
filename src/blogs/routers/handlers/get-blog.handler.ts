import { Request, Response } from "express";

import { blogsRepository } from "../../repositories/blogs.repository";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { errorMessages } from "../../../core/utils/error-messages.util";

export function getBlogByIdHandler(
  req: Request<{ id: string }>,
  res: Response
) {
  const id = req.params.id;

  const currentBlog = blogsRepository.findBlogById(id);

  if (!currentBlog) {
    return res
      .status(HTTP_STATUS_CODES.NOT_FOUND_404)
      .json(
        errorMessages([
          { field: "id", message: `Blog with id=${id} is not found` },
        ])
      );
  }

  res.status(HTTP_STATUS_CODES.OK_200).json(currentBlog);
}
