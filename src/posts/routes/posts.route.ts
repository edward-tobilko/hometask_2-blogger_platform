import { Router } from "express";

import { getPostListHandler } from "./http-handlers/get-post-list.handler";
import { getPostHandler } from "./http-handlers/get-post.handler";
import { paramIdValidation } from "../../core/middlewares/validation/param-id.middleware-validation";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { baseAuthGuard } from "../../auth/api/guards/base-auth.guard";
import { postBodyInputValidationMiddleware } from "../validations/post-input-dto-validation.middleware";
import { deletePostHandler } from "./http-handlers/delete-post.handler";
import { queryPaginationAndSortingValidation } from "../../core/middlewares/validation/query-pagination-sorting.middleware-validation";
import {
  PostCommentsSortField,
  PostSortField,
} from "./request-payloads/post-sort-fields.request-payload";
import { createPostHandler } from "./http-handlers/create-post.handler";
import { updatePostHandler } from "./http-handlers/update-post.handler";
import { createCommentHandler } from "./http-handlers/create-comment.handler";
import { createCommentDtoValidation } from "../validations/create-comment-dto.validation";
import { jwtAuthGuard } from "../../auth/api/guards/jwt-auth.guard";
import { getPostCommentsHandler } from "./http-handlers/get-post-comments.handler";

export const postsRoute = Router({});

// * GET methods
postsRoute.get(
  "",
  queryPaginationAndSortingValidation<PostSortField>(PostSortField),
  inputResultMiddlewareValidation,
  getPostListHandler
);

postsRoute.get(
  "/:id",
  paramIdValidation,
  inputResultMiddlewareValidation,
  getPostHandler
);

postsRoute.get(
  "/:postId/comments",
  queryPaginationAndSortingValidation<PostCommentsSortField>(
    PostCommentsSortField
  ),
  inputResultMiddlewareValidation,
  getPostCommentsHandler
);

// * POST methods
postsRoute.post(
  "",
  baseAuthGuard,
  postBodyInputValidationMiddleware,
  inputResultMiddlewareValidation,
  createPostHandler
);

postsRoute.post(
  "/:postId/comments",
  jwtAuthGuard,
  createCommentDtoValidation,
  inputResultMiddlewareValidation,
  createCommentHandler
);

// * PUT methods
postsRoute.put(
  "/:id",
  baseAuthGuard,
  paramIdValidation,
  postBodyInputValidationMiddleware,
  inputResultMiddlewareValidation,
  updatePostHandler
);

// * DELETE methods
postsRoute.delete(
  "/:id",
  baseAuthGuard,
  paramIdValidation,
  inputResultMiddlewareValidation,
  deletePostHandler
);
