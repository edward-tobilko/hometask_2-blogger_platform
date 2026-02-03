import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { inject, injectable } from "inversify";

import { mapApplicationStatusToHttpStatus } from "@core/result/map-app-status-to-http.result";
import { Types } from "@core/di/types";
import { IUsersQueryService } from "users/interfaces/IUsersQueryService";
import { CreatePostCommentRP } from "./request-payload-types/create-post-comment.request-payload-types";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { createCommand } from "@core/helpers/create-command.helper";
import { CreateCommentForPostDtoCommand } from "posts/application/commands/create-comment-for-post-dto.command";
import { errorsHandler } from "@core/errors/errors-handler.error";
import { IPostsService } from "posts/interfaces/IPostsService";

type ReqParams = { postId: string };
type ReqUser = { id: string };

@injectable()
export class PostsController {
  constructor(
    @inject(Types.IUsersQueryService)
    private usersQueryService: IUsersQueryService,
    @inject(Types.IPostsService) private postsService: IPostsService
  ) {}

  // * arrow-handler, что бы не биндить в роутере
  createCommentHandler = async (
    req: Request<ReqParams, {}, CreatePostCommentRP, {}>,
    res: Response
  ) => {
    try {
      const sanitizedParamsData = matchedData<ReqParams>(req, {
        locations: ["params"],
        includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
      });

      const sanitizedBodyData = matchedData<CreatePostCommentRP>(req, {
        locations: ["body"],
        includeOptionals: false,
      });

      const user = req.user as ReqUser; // from auth -> api/guards -> JWT guard

      const userById = await this.usersQueryService.getUserById(user.id);

      if (!userById) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      const command = createCommand<CreateCommentForPostDtoCommand>({
        postId: sanitizedParamsData.postId,
        content: sanitizedBodyData.content,

        userId: user.id,
        userLogin: userById.login,
      });

      const postCommentOutput =
        await this.postsService.createPostComment(command);

      if (!postCommentOutput.isSuccess()) {
        return res
          .status(mapApplicationStatusToHttpStatus(postCommentOutput.status))
          .json({ errorsMessages: postCommentOutput.extensions });
      }

      res.status(HTTP_STATUS_CODES.CREATED_201).json(postCommentOutput.data);
    } catch (error: unknown) {
      errorsHandler(error, req, res);
    }
  };
}

// ? Request<Params, ResBody, ReqBody, Query>
