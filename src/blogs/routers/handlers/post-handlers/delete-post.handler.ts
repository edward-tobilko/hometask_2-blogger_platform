import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../../core/utils/http-statuses.util";
import { postRepository } from "../../../repositories/posts.repository";
import { errorMessages } from "../../../../core/utils/error-messages.util";

export function deletePostHandler(req: Request<{ id: string }>, res: Response) {
  const deletedPost = postRepository.deletePost(req.params.id);

  if (!deletedPost) {
    return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json(
      errorMessages([
        {
          field: "id",
          message: `Post with id=${req.params.id} is not found`,
        },
      ])
    );
  }

  res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
}
