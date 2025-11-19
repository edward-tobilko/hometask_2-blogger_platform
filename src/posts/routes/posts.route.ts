import { Router } from "express";

import { getPostListHandler } from "./handlers/get-post-list.handler";
import { getPostHandler } from "./handlers/get-post.handler";
import { paramIdValidation } from "../../core/middlewares/validation/param-id.middleware-validation";
import { inputValidationResultMiddleware } from "../../core/middlewares/validation/input-result.middleware-validation";
import { createNewPostHandler } from "./handlers/create-post.handler";
import { adminGuardMiddlewareAuth } from "../../auth/middlewares/admin-guard.middleware";
import { postBodyInputValidationMiddleware } from "../validations/post-input-dto-validation.middleware";
import { updatePostHandler } from "./handlers/update-post.handler";
import { deletePostHandler } from "./handlers/delete-post.handler";
import { paginationAndSortingValidation } from "../../core/middlewares/validation/query-pagination-sorting.middleware-validation";
import { PostSortField } from "../types/post.types";

export const postsRoute = Router({});

// * GET methods
postsRoute.get(
  "",
  paginationAndSortingValidation(PostSortField),
  inputValidationResultMiddleware,
  getPostListHandler
);
postsRoute.get(
  "/:id",
  paramIdValidation,
  inputValidationResultMiddleware,
  getPostHandler
);

// * POST methods
postsRoute.post(
  "",
  adminGuardMiddlewareAuth,
  postBodyInputValidationMiddleware,
  inputValidationResultMiddleware,
  createNewPostHandler
);

// * PUT methods
postsRoute.put(
  "/:id",
  adminGuardMiddlewareAuth,
  paramIdValidation,
  postBodyInputValidationMiddleware,
  inputValidationResultMiddleware,
  updatePostHandler
);

// * DELETE methods
postsRoute.delete(
  "/:id",
  adminGuardMiddlewareAuth,
  paramIdValidation,
  inputValidationResultMiddleware,
  deletePostHandler
);
