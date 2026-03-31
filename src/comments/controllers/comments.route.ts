import { Router } from "express";

import {
  paramCommentIdValidation,
  paramIdValidation,
} from "../../core/middlewares/validation/param-id.middleware-validation";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { jwtAccessAuthGuard } from "../../auth/presentation/guards/jwt-access-auth.guard";
import { optionalJwtAccessGuard } from "auth/presentation/guards/optional-jwt-access-auth.guard";
import { CommentsController } from "comments/presentation/controllers/comments.controller";
import { IJWTService } from "auth/application/interfaces/jwt-service.interface";
import { updateCommentLikeStatusRPValidation } from "comments/presentation/request-payload-validations/update-comment-likeStatus.rpv";
import { updateCommentContentRPValidation } from "comments/presentation/request-payload-validations/update-comment-content.rpv";

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
