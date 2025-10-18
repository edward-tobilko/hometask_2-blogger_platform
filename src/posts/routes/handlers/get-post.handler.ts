import { Request, Response } from "express";
import { log } from "node:console";

import { postRepository } from "../../repositories/posts.repository";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import {
  ErrorMessages,
  errorMessagesUtil,
} from "../../../core/utils/api-error-result.util";
import { mapToPostViewModelUtil } from "../mappers/map-to-post-view-model.util";
import { PostView } from "../../types/post.types";

export async function getPostHandler(
  req: Request<{ id: string }>,
  res: Response<PostView | { errorsMessages: ErrorMessages[] }>
) {
  try {
    const postView = await postRepository.getPostById(req.params.id);

    if (!postView) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json(
        errorMessagesUtil([
          {
            message: `Blog with id=${req.params.id} is not found`,
            field: "id",
          },
        ])
      );
    }

    log("Get post by ID ->", mapToPostViewModelUtil(postView));

    res.status(HTTP_STATUS_CODES.OK_200).json(mapToPostViewModelUtil(postView));
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
