import { Router } from "express";

import {
  paramCommentIdValidation,
  paramIdValidation,
} from "./../../core/middlewares/validation/param-id.middleware-validation";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { jwtAccessAuthGuard } from "../../auth/api/guards/jwt-access-auth.guard";
import { updateCommentDtoRPValidation } from "./request-payload-validations/update-comment.request-payload-validation";
import { CommentsController } from "comments/routes/comments.controller";
import { IJWTService } from "auth/interfaces/IJWTService";

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

    commentsController.getCommentsHandler.bind(commentsController)
  );

  // * PUT: Update existing comment by id with input model
  commentsRoute.put(
    "/:commentId",
    jwtAccessAuthGuard(jwtService),
    paramCommentIdValidation,
    updateCommentDtoRPValidation,
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
