import { Request, Response } from "express";
import { matchedData } from "express-validator";

import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { CreateCommentRequestPayload } from "../request-payloads/create-comment.request-payload";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { CreateCommentForPostDtoCommand } from "../../application/commands/create-comment-for-post-dto.command";
import { postsService } from "../../application/posts-service";
import { userQueryService } from "../../../users/applications/users-query.service";

type ReqParams = { postId: string };
type ReqUser = { id: string };

export const createCommentHandler = async (
  req: Request<ReqParams, {}, CreateCommentRequestPayload, {}>,
  res: Response
) => {
  try {
    const sanitizedParamsData = matchedData<ReqParams>(req, {
      locations: ["params"],
      includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
    });

    const sanitizedBodyData = matchedData<CreateCommentRequestPayload>(req, {
      locations: ["body"],
      includeOptionals: false,
    });

    const user = req.user as ReqUser; // from auth -> api/guards -> JWT guard

    const userById = await userQueryService.getUserById(user.id);

    if (!userById) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const command = createCommand<CreateCommentForPostDtoCommand>({
      postId: sanitizedParamsData.postId,
      content: sanitizedBodyData.content,

      userId: user.id,
      userLogin: userById.login,
    });

    const postCommentOutput = await postsService.createPostComment(command);

    res.status(HTTP_STATUS_CODES.CREATED_201).json(postCommentOutput.data);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
