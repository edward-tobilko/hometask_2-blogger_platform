import { Router } from "express";

import { getCommentsHandler } from "./http-handlers/get-comments.handler";
import {
  paramCommentIdValidation,
  paramIdValidation,
} from "./../../core/middlewares/validation/param-id.middleware-validation";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { deleteCommentHandler } from "./http-handlers/delete-comment.handler";
import { jwtAuthGuard } from "../../auth/api/guards/jwt-auth.guard";

export const commentsRoute = Router({});

// * GET
commentsRoute.get(
  "/:id",
  paramIdValidation,
  inputResultMiddlewareValidation,
  getCommentsHandler
);

// * DELETE
commentsRoute.delete(
  "/:commentId",
  jwtAuthGuard,
  paramCommentIdValidation,
  inputResultMiddlewareValidation,
  deleteCommentHandler
);
