import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { postRepository } from "../../repositories/posts.repository";
import {
  ErrorMessages,
  errorMessagesUtil,
} from "../../../core/utils/error-messages.util";

export async function deletePostHandler(
  req: Request<{ id: string }>,
  res: Response<{ errorsMessages: ErrorMessages[] }>
) {
  try {
    const deletePostResponse = await postRepository.deletePost(req.params.id);

    if (!deletePostResponse) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json(
        errorMessagesUtil([
          {
            message: `Post with id=${req.params.id} is not found`,
            field: "id",
          },
        ])
      );
    }

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
