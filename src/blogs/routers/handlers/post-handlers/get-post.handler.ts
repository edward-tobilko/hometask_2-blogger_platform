import { Request, Response } from "express";
import { log } from "node:console";

import { postRepository } from "../../../repositories/posts.repository";
import { HTTP_STATUS_CODES } from "../../../../core/utils/http-statuses.util";
import { errorMessages } from "../../../../core/utils/error-messages.util";

export function getPostHandler(req: Request<{ id: string }>, res: Response) {
  const post = postRepository.getPostById(req.params.id);

  if (!post) {
    return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json(
      errorMessages([
        {
          field: "id",
          message: `Blog with id=${req.params.id} is not found`,
        },
      ])
    );
  }

  log("Get post by ID ->", post);

  res.status(HTTP_STATUS_CODES.OK_200).json(post);
}
