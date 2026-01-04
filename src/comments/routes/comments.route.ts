import { Router } from "express";

import { getCommentsHandler } from "./http-handlers/get-comments.handler";
import {
  paramCommentIdValidation,
  paramIdValidation,
} from "./../../core/middlewares/validation/param-id.middleware-validation";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { deleteCommentHandler } from "./http-handlers/delete-comment.handler";
import { jwtAuthGuard } from "../../auth/api/guards/jwt-auth.guard";
import { updateCommentHandler } from "./http-handlers/update-comment.handler";
import { updateCommentDtoRPValidation } from "./request-payload-validations/update-comment.request-payload-validation";

export const commentsRoute = Router({});

// * GET
// Return comment by id
commentsRoute.get(
  "/:id",
  paramIdValidation,
  inputResultMiddlewareValidation,
  getCommentsHandler
);

// * PUT
// Update existing comment by id with input model
commentsRoute.put(
  "/:commentId",
  jwtAuthGuard,
  paramCommentIdValidation,
  updateCommentDtoRPValidation,
  inputResultMiddlewareValidation,
  updateCommentHandler
);

// * DELETE
// Delete comment specified by id
commentsRoute.delete(
  "/:commentId",
  jwtAuthGuard,
  paramCommentIdValidation,
  inputResultMiddlewareValidation,
  deleteCommentHandler
);
