import { Router } from "express";

import { updateCommentContentRPValidation } from "../request-payload-validations/update-comment-content.rpv";
import { IJWTService } from "auth/interfaces/IJWTService";
import { updateCommentLikeStatusRPValidation } from "../request-payload-validations/update-comment-likeStatus.rpv";
import { optionalJwtAccessGuard } from "auth/api/guards/optional-jwt-access-auth.guard";
import { CommentsController } from "./comments.controller";
import {
  paramCommentIdValidation,
  paramIdValidation,
} from "@core/middlewares/validation/param-id.middleware-validation";
import { inputResultMiddlewareValidation } from "@core/middlewares/validation/input-result.middleware-validation";
import { jwtAccessAuthGuard } from "auth/api/guards/jwt-access-auth.guard";

export const createCommentsRouter = (
  commentsController: CommentsController,
  jwtService: IJWTService
) => {
  const commentsRoute = Router({});

  // * PUT: Make like / unlike / dislike / undislike operation
  commentsRoute.put(
    "/:commentId/like-status",
    jwtAccessAuthGuard(jwtService),
    paramCommentIdValidation,
    updateCommentLikeStatusRPValidation,
    inputResultMiddlewareValidation,

    commentsController.updateCommentLikeStatusHandler.bind(commentsController)
  );

  // * PUT: Update existing comment by id with input model
  commentsRoute.put(
    "/:commentId",
    jwtAccessAuthGuard(jwtService),
    paramCommentIdValidation,
    updateCommentContentRPValidation,
    inputResultMiddlewareValidation,

    commentsController.updateCommentHandler.bind(commentsController)
  );

  // * DELETE: Delete comment specified by id
  commentsRoute.delete(
    "/:commentId",
    jwtAccessAuthGuard(jwtService),
    paramCommentIdValidation,
    inputResultMiddlewareValidation,

    commentsController.deleteCommentHandler.bind(commentsController)
  );

  // * GET: Return comment by id
  commentsRoute.get(
    "/:id",
    optionalJwtAccessGuard(jwtService), // * Получаем токен для передачи userId для вычисления динамического myStatus
    paramIdValidation,
    inputResultMiddlewareValidation,

    commentsController.getCommentByIdHandler.bind(commentsController)
  );

  return commentsRoute;
};
