import { Router } from "express";

import {
  paramCommentIdValidation,
  paramIdValidation,
} from "./../../core/middlewares/validation/param-id.middleware-validation";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { jwtAccessAuthGuard } from "../../auth/api/guards/jwt-access-auth.guard";
import { updateCommentContentRPValidation } from "./request-payload-validations/update-comment-content.rpv";
import { CommentsController } from "comments/routes/comments.controller";
import { IJWTService } from "auth/interfaces/IJWTService";
import { updateCommentLikeStatusRPValidation } from "./request-payload-validations/update-comment-likeStatus.rpv";
import { optionalJwtAccessGuard } from "auth/api/guards/optional-jwt-access-auth.guard";

export const createCommentsRouter = (
  commentsController: CommentsController,
  jwtService: IJWTService
) => {
  const commentsRoute = Router({});

  // * GET: Return comment by id
  commentsRoute.get(
    "/:id",
    paramIdValidation,
    inputResultMiddlewareValidation,
    optionalJwtAccessGuard(jwtService), // * Получаем токен для передачи userId для вычисления динамического myStatus

    commentsController.getCommentByIdHandler.bind(commentsController)
  );

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

  return commentsRoute;
};
