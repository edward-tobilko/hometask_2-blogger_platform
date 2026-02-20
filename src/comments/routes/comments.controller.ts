import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { matchedData } from "express-validator";

import { errorsHandler } from "@core/errors/errors-handler.error";
import { mapApplicationStatusToHttpStatus } from "@core/result/map-app-status-to-http.result";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { Types } from "@core/di/types";
import { CommentsQueryService } from "../application/comments-query.service";
import { UpdateCommentRP } from "./request-payload-types/update-comment.request-payload-types";
import { createCommand } from "@core/helpers/create-command.helper";
import { UpdateCommentDtoCommand } from "../application/commands/update-comment-dto.command";
import { CommentsService } from "../application/comments.service";
import { LikeStatus } from "@core/types/like-status.enum";

@injectable()
export class CommentsController {
  constructor(
    @inject(Types.ICommentsQueryService)
    private commentsQueryService: CommentsQueryService,
    @inject(Types.ICommentsService) private commentsService: CommentsService
  ) {}

  async getCommentByIdHandler(req: Request<{ id: string }>, res: Response) {
    try {
      const commentId = req.params.id;

      // * Если jwtAuthGuard прошел → userId уже есть
      const currentUserId = req.user?.id;

      const commentOutput = await this.commentsQueryService.getCommentById(
        commentId,
        currentUserId // * Передаем userId для вычисления myStatus
      );

      if (!commentOutput.isSuccess()) {
        return res
          .status(mapApplicationStatusToHttpStatus(commentOutput.status))
          .json({ errorsMessages: commentOutput.extensions });
      }

      res.status(HTTP_STATUS_CODES.OK_200).json(commentOutput.data);
    } catch (error: unknown) {
      console.log("ERROR HANDLER:", error);

      errorsHandler(error, req, res);
    }
  }

  async updateCommentHandler(
    req: Request<{ commentId: string }, {}, UpdateCommentRP, {}>,
    res: Response
  ) {
    try {
      const userId = req.user.id; // from express.d.ts (именно через middleware jwtAuthGuard мы пропускаем правильного юзера с токеном).

      const sanitizedBody = matchedData<UpdateCommentRP>(req, {
        locations: ["body"],
        includeOptionals: false,
      });

      const command = createCommand<UpdateCommentDtoCommand>({
        commentId: req.params.commentId,
        ...sanitizedBody,
      });

      const commentRes = await this.commentsService.updateComment(
        command,
        userId
      );

      if (!commentRes.isSuccess()) {
        return res
          .status(mapApplicationStatusToHttpStatus(commentRes.status))
          .json({ errorsMessages: commentRes.extensions });
      }

      res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      console.log("ERROR HANDLER:", error);

      errorsHandler(error, req, res);
    }
  }

  async deleteCommentHandler(
    req: Request<{ commentId: string }>,
    res: Response
  ) {
    try {
      // * Получаем от express.d.ts (именно через middleware jwtAuthGuard мы пропускаем правильного юзера с токеном)
      const userId = req.user.id;

      await this.commentsService.deleteCommentById(
        req.params.commentId,
        userId
      );

      res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      console.log("ERROR HANDLER:", error);

      errorsHandler(error, req, res);
    }
  }

  async updateCommentLikeStatusHandler(
    req: Request<{ commentId: string }, {}, { likeStatus: string }, {}>,
    res: Response
  ) {
    try {
      // * Валидируем body
      const sanitizedBody = matchedData<{ likeStatus: string }>(req, {
        locations: ["body"],
        includeOptionals: false,
      });

      // * Создаем сомманду
      const command = createCommand<{
        likeStatus: LikeStatus;
        commentId: string;
        userId: string;
      }>({
        commentId: req.params.commentId,
        userId: req.user.id,
        likeStatus: sanitizedBody.likeStatus as LikeStatus,
      });

      const result = await this.commentsService.updateCommentLikeStatusById(
        command.payload
      );

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
  }
}

// ? Request<Params, ResBody, ReqBody, Query>

// ? Можно убрать try/catch, потому что Service (CommentsService) не бросает (throw) ошибки, а возвращает ApplicationResult.
