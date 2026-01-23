import { Router } from "express";

import { getPostListHandler } from "./http-handlers/get-post-list.handler";
import { getPostHandler } from "./http-handlers/get-post.handler";
import {
  paramIdValidation,
  paramPostIdValidation,
} from "../../core/middlewares/validation/param-id.middleware-validation";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { baseAuthGuard } from "../../auth/api/guards/base-auth.guard";
import { deletePostHandler } from "./http-handlers/delete-post.handler";
import { queryPaginationAndSortingValidation } from "../../core/middlewares/validation/query-pagination-sorting.middleware-validation";
import {
  PostCommentsSortFieldRP,
  PostSortFieldRP,
} from "./request-payload-types/post-sort-field.request-payload-types";
import { createPostHandler } from "./http-handlers/create-post.handler";
import { updatePostHandler } from "./http-handlers/update-post.handler";
import { createCommentHandler } from "./http-handlers/create-comment.handler";
import { jwtAuthGuard } from "../../auth/api/guards/jwt-auth.guard";
import { getPostCommentsHandler } from "./http-handlers/get-post-comments.handler";
import { createCommentDtoRPValidation } from "./request-payload-validations/create-comment-dto.validation";
import { postBodyInputRPValidation } from "./request-payload-validations/post-input-dto-validation.middleware";

export const postsRoute = Router({});

// * GET: Returns all posts
postsRoute.get(
  "",
  queryPaginationAndSortingValidation<PostSortFieldRP>(PostSortFieldRP),
  inputResultMiddlewareValidation,
  getPostListHandler
);

// * GET: Return post by id
postsRoute.get(
  "/:id",
  paramIdValidation,
  inputResultMiddlewareValidation,
  getPostHandler
);

// * GET: Returns comments for specified post
postsRoute.get(
  "/:postId/comments",
  paramPostIdValidation,
  queryPaginationAndSortingValidation<PostCommentsSortFieldRP>(
    PostCommentsSortFieldRP
  ),
  inputResultMiddlewareValidation,
  getPostCommentsHandler
);

// * POST: Create new post
postsRoute.post(
  "",
  baseAuthGuard,
  postBodyInputRPValidation,
  inputResultMiddlewareValidation,
  createPostHandler
);

// * POST: Create new comment
postsRoute.post(
  "/:postId/comments",
  jwtAuthGuard,
  createCommentDtoRPValidation,
  inputResultMiddlewareValidation,
  createCommentHandler
);

// * PUT: Update existing post by id with input model
postsRoute.put(
  "/:id",
  baseAuthGuard,
  paramIdValidation,
  postBodyInputRPValidation,
  inputResultMiddlewareValidation,
  updatePostHandler
);

// * DELETE: Delete post specified by id
postsRoute.delete(
  "/:id",
  baseAuthGuard,
  paramIdValidation,
  inputResultMiddlewareValidation,
  deletePostHandler
);
