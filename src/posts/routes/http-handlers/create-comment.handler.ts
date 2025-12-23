import { Request, Response } from "express";
import { matchedData } from "express-validator";

import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { CreateCommentRequestPayload } from "../request-payloads/create-comment.request-payload";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { CreateCommentForPostDtoCommand } from "../../application/commands/create-comment-for-post-dto.command";
import { postsService } from "../../application/posts-service";

type ReqParams = { postId: string };

// // підстав свій тип, якщо в тебе інакше
// type ReqUser = { id: string; login: string };

export const createCommentHandler = async (
  req: Request<ReqParams, {}, CreateCommentRequestPayload, {}>,
  res: Response
) => {
  try {
    const sanitizedBodyData = matchedData<CreateCommentRequestPayload>(req, {
      locations: ["params", "body"],
      includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
    });

    // const user = req.user as ReqUser; // from JWT guard

    const command = createCommand<CreateCommentForPostDtoCommand>({
      postId: sanitizedBodyData.postId,
      content: sanitizedBodyData.content,
    });

    const postCommentOutput = await postsService.createPostComment(command);

    res.status(HTTP_STATUS_CODES.CREATED_201).json(postCommentOutput);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
