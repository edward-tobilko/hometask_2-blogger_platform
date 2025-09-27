import { Request, Response } from "express";

import { errorMessages } from "../../../../core/utils/error-messages.util";
import { HTTP_STATUS_CODES } from "../../../../core/utils/http-statuses.util";
import { blogsRepository } from "../../../repositories/blogs.repository";

export function deleteBlogHandler(req: Request<{ id: string }>, res: Response) {
  const blog = blogsRepository.findBlogById(req.params.id);

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

  blogsRepository.deleteBlog(req.params.id);

  res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
}
