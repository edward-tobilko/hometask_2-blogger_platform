import { Router } from "express";

import { getPostListHandler } from "./http-handlers/get-post-list.handler";
import { getPostHandler } from "./http-handlers/get-post.handler";
import { paramIdValidation } from "../../core/middlewares/validation/param-id.middleware-validation";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
// import { createNewPostHandler } from "./handlers/create-post.handler";
import { adminGuardMiddlewareAuth } from "../../auth/middlewares/admin-guard.middleware";
import { postBodyInputValidationMiddleware } from "../validations/post-input-dto-validation.middleware";
// import { updatePostHandler } from "./handlers/update-post.handler";
import { deletePostHandler } from "./http-handlers/delete-post.handler";
import { queryPaginationAndSortingValidation } from "../../core/middlewares/validation/query-pagination-sorting.middleware-validation";
import { PostSortField } from "./request-payloads/post-sort-field.request-payload";

export const postsRoute = Router({});

// * GET methods
postsRoute.get(
  "",
  queryPaginationAndSortingValidation(PostSortField),
  inputResultMiddlewareValidation,
  getPostListHandler
);
postsRoute.get(
  "/:id",
  paramIdValidation,
  inputResultMiddlewareValidation,
  getPostHandler
);

// * POST methods
postsRoute.post(
  "",
  adminGuardMiddlewareAuth,
  postBodyInputValidationMiddleware,
  inputResultMiddlewareValidation
  // createNewPostHandler
);

// * PUT methods
postsRoute.put(
  "/:id",
  adminGuardMiddlewareAuth,
  paramIdValidation,
  postBodyInputValidationMiddleware,
  inputResultMiddlewareValidation
  // updatePostHandler
);

// * DELETE methods
postsRoute.delete(
  "/:id",
  adminGuardMiddlewareAuth,
  paramIdValidation,
  inputResultMiddlewareValidation,
  deletePostHandler
);
