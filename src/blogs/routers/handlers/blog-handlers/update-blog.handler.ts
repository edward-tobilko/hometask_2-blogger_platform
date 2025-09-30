import { Request, Response } from "express";

import { BlogInputDtoTypeModel } from "../../../../types/blog.types";
import { HTTP_STATUS_CODES } from "../../../../core/utils/http-statuses.util";
import { errorMessages } from "../../../../core/utils/error-messages.util";
import { blogsRepository } from "../../../repositories/blogs.repository";

export function updateBlogHandler(
  req: Request<{ id: string }, {}, BlogInputDtoTypeModel>,
  res: Response
) {
  const blog = blogsRepository.findBlogById(+req.params.id);

  if (!blog) {
    return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json(
      errorMessages([
        {
          field: "id",
          message: `Blog with id=${req.params.id} is not found`,
        },
      ])
    );
  }

  blogsRepository.updateBlog(+req.params.id, req.body);

  res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
}
