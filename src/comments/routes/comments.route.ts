import { Router } from "express";

import { getCommentsHandler } from "./http-handlers/get-comments.handler";
import { paramIdValidation } from "./../../core/middlewares/validation/param-id.middleware-validation";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { deleteCommentHandler } from "./http-handlers/delete-comment.handler";

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
  paramIdValidation,
  inputResultMiddlewareValidation,
  deleteCommentHandler
);
