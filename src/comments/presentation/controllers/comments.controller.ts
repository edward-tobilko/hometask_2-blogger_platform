import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { matchedData } from "express-validator";

import { errorsHandler } from "@core/errors/errors-handler.error";
import { mapApplicationStatusToHttpStatus } from "@core/result/map-app-status-to-http.result";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { DiTypes } from "@core/di/types";
import { UpdateCommentRP } from "../request-payload-types/update-comment.request-payload-types";
import { createCommand } from "@core/helpers/create-command.helper";
import { LikeStatus } from "@core/types/like-status.enum";
import { UpdateCommentDtoCommand } from "@comments/application/commands/update-comment-dto.command";
import { ICommentsQueryService } from "@comments/application/interfaces/comments-query-service.interface";
import { ICommentsService } from "@comments/application/interfaces/comments-service.interface";

@injectable()
export class CommentsController {
  constructor(
    @inject(DiTypes.ICommentsQueryService)
    private commentsQueryService: ICommentsQueryService,
    @inject(DiTypes.ICommentsService) private commentsService: ICommentsService
  ) {}

  async updateCommentLikeStatusHandler(
    req: Request<{ commentId: string }, {}, { likeStatus: string }, {}>,
    res: Response
  ) {
    try {
      // * Validate body
      const sanitizedBody = matchedData<{ likeStatus: string }>(req, {
        locations: ["body"],
        includeOptionals: false,
      });

      // * Create command
      const command = createCommand<{
        likeStatus: LikeStatus;
        commentId: string;
        userId: string;
      }>({
        commentId: req.params.commentId,
        userId: req.user.id,
        likeStatus: sanitizedBody.likeStatus as LikeStatus,
      });

      // * Get result
      const result = await this.commentsService.upsertCommentLikeStatus(
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

      await this.commentsService.deleteComment(req.params.commentId, userId);

      res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      console.log("ERROR HANDLER:", error);

      errorsHandler(error, req, res);
    }
  }

  async getCommentByIdHandler(req: Request<{ id: string }>, res: Response) {
    try {
      const commentId = req.params.id;

      // * Если optionalJwtAccessGuard прошел → userId уже есть
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
}

// ? Request<Params, ResBody, ReqBody, Query>

// ? Можно убрать try/catch, потому что Service (CommentsService) не бросает (throw) ошибки, а возвращает ApplicationResult.
