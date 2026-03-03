import { NextFunction, Request, Response } from "express";
import { matchedData } from "express-validator";
import { inject, injectable } from "inversify";
import { log } from "console";

import { mapApplicationStatusToHttpStatus } from "@core/result/map-app-status-to-http.result";
import { DiTypes } from "@core/di/types";
import { IUsersQueryService } from "users/interfaces/IUsersQueryService";
import { CreatePostCommentRP } from "../request-payload-types/create-post-comment.request-payload-types";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { createCommand } from "@core/helpers/create-command.helper";
import { CreateCommentForPostDtoCommand } from "posts/application/commands/create-comment-for-post-dto.command";
import { errorsHandler } from "@core/errors/errors-handler.error";
import { IPostsService } from "posts/application/interfaces/posts-service.interface";
import { PostsListRP } from "../request-payload-types/posts-list.request-payload-types";
import { setDefaultSortAndPaginationIfNotExist } from "@core/helpers/set-default-sort-pagination.helper";
import {
  PostCommentsSortFieldRP,
  PostSortFieldRP,
} from "../request-payload-types/post-sort-field.request-payload-types";
import { IPostsQueryService } from "posts/application/interfaces/posts-query-service.interface";
import { GetPostCommentsListQueryHandler } from "posts/application/query-handlers/get-post-comments-list.query-handler";
import { CreatePostRP } from "../request-payload-types/create-post.request-payload-types";
import { CreatePostDtoCommand } from "posts/application/commands/create-post-dto.command";
import { UpdatePostRP } from "../request-payload-types/update-post.request-payload-types";
import { UpdatePostDtoCommand } from "posts/application/commands/update-post-dto.command";

@injectable()
export class PostsController {
  constructor(
    @inject(DiTypes.IUsersQueryService)
    private usersQueryService: IUsersQueryService,
    @inject(DiTypes.IPostsService) private postsService: IPostsService,
    @inject(DiTypes.IPostsQueryService)
    private postQueryService: IPostsQueryService
  ) {}

  // * arrow-handler, что бы не биндить в роутере
  getPostsListHandler = async (
    req: Request<{}, {}, {}, {}>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sanitizedQueryParam = matchedData<PostsListRP>(req, {
        locations: ["query"],
        includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
      });

      const queryParam =
        setDefaultSortAndPaginationIfNotExist<PostSortFieldRP>(
          sanitizedQueryParam
        );

      const postsListOutput =
        await this.postQueryService.getPostsList(queryParam);

      res.status(HTTP_STATUS_CODES.OK_200).json(postsListOutput);
    } catch (error: unknown) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
        errorsMessages: [
          { message: "Internal Server Error", field: "query params" },
        ],
      });

      next(error);
    }
  };

  getPostHandler = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const post = await this.postQueryService.getPostById(req.params.id);

      if (!post) return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);

      res.status(HTTP_STATUS_CODES.OK_200).json(post);
    } catch (error: unknown) {
      console.log("ERROR HANDLER:", error);

      errorsHandler(error, req, res);
    }
  };

  getPostCommentsHandler = async (
    req: Request<{ postId: string }, {}, GetPostCommentsListQueryHandler, {}>,
    res: Response
  ) => {
    try {
      const postId = req.params.postId;

      // * Если optionalJwtAccessGuard прошел → userId уже есть
      const currentUserId = req.user?.id;

      const sanitizedQueryParam = matchedData<GetPostCommentsListQueryHandler>(
        req,
        {
          locations: ["query"],
          includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
        }
      );

      const queryParamInput = {
        ...setDefaultSortAndPaginationIfNotExist<PostCommentsSortFieldRP>(
          sanitizedQueryParam
        ),

        postId,
      };

      const postCommentsListOutput =
        await this.postQueryService.getPostCommentsList(
          queryParamInput,
          currentUserId // * Передаем userId для вычисления myStatus
        );

      if (!postCommentsListOutput.isSuccess()) {
        return res
          .status(
            mapApplicationStatusToHttpStatus(postCommentsListOutput.status)
          )
          .json({ errorsMessages: postCommentsListOutput.extensions });
      }

      res.status(HTTP_STATUS_CODES.OK_200).json(postCommentsListOutput.data);
    } catch (error: unknown) {
      console.log("ERROR HANDLER:", error);

      errorsHandler(error, req, res);
    }
  };

  createPostHandler = async (
    req: Request<{}, {}, CreatePostRP, {}>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sanitizedBodyParam = matchedData<CreatePostRP>(req, {
        locations: ["body"],
        includeOptionals: true,
      });

      const command = createCommand<CreatePostDtoCommand>(sanitizedBodyParam);

      const postOutput = await this.postsService.createPost(command);

      log(postOutput.data);

      res.status(HTTP_STATUS_CODES.CREATED_201).json(postOutput.data);
    } catch (error: unknown) {
      console.log("ERROR HANDLER:", error);

      res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);

      next(error);
    }
  };

  createCommentHandler = async (
    req: Request<{ postId: string }, {}, CreatePostCommentRP, {}>,
    res: Response
  ) => {
    try {
      const sanitizedParamsData = matchedData<{ postId: string }>(req, {
        locations: ["params"],
        includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
      });

      const sanitizedBodyData = matchedData<CreatePostCommentRP>(req, {
        locations: ["body"],
        includeOptionals: false,
      });

      const user = req.user as { id: string }; // from auth -> api/guards -> JWT guard

      const userById = await this.usersQueryService.getUserById(user.id);

      if (!userById) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

      const command = createCommand<CreateCommentForPostDtoCommand>({
        content: sanitizedBodyData.content,
        postId: sanitizedParamsData.postId,

        commentatorInfo: {
          userId: user.id,
          userLogin: userById.login,
        },

        createdAt: new Date(),
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
      console.log("ERROR HANDLER:", error);

      errorsHandler(error, req, res);
    }
  };

  deletePostHandler = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id = req.params.id;

      const result = await this.postsService.deletePost(id);

      if (!result.isSuccess()) {
        return res
          .status(mapApplicationStatusToHttpStatus(result.status))
          .json({ errorsMessages: result.extensions });
      }

      res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      console.log("ERROR HANDLER:", error);

      errorsHandler(error, req, res);
    }
  };

  updatePostHandler = async (
    req: Request<{ id: string }, {}, UpdatePostRP, {}>,
    res: Response
  ) => {
    try {
      const sanitizedBody = matchedData<UpdatePostRP>(req, {
        locations: ["body"],
        includeOptionals: true,
      });

      const command = createCommand<UpdatePostDtoCommand>({
        id: req.params.id,
        ...sanitizedBody,
      });

      const result = await this.postsService.updatePost(command);

      if (!result.isSuccess()) {
        return res
          .status(mapApplicationStatusToHttpStatus(result.status))
          .json({ errorsMessages: result.extensions });
      }

      res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      console.log("ERROR HANDLER:", error);

      errorsHandler(error, req, res);
    }
  };
}

// ? Request<Params, ResBody, ReqBody, Query>
