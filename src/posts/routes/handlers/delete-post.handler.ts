import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { postRepository } from "../../repositories/posts.repository";
import {
  ErrorMessages,
  errorMessagesUtil,
} from "../../../core/utils/api-error-result.util";

export async function deletePostHandler(
  req: Request<{ id: string }>,
  res: Response<{ errorsMessages: ErrorMessages[] }>
) {
  try {
    const id = req.params.id;

    const postDb = await postRepository.getPostById(id);

    if (!postDb) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json(
        errorMessagesUtil([
          {
            message: `Post with id=${id} is not found`,
            field: "id",
          },
        ])
      );
    }

    await postRepository.deletePost(id);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
