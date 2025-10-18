import { Router } from "express";

import { getPostListHandler } from "./handlers/get-post-list.handler";
import { getPostHandler } from "./handlers/get-post.handler";
import { paramIdMiddlewareValidation } from "../../core/middlewares/validation/param-id-validation.middleware";
import { inputValidationResultMiddleware } from "../../core/middlewares/validation/input-validation-result.middleware";
import { createNewPostHandler } from "./handlers/create-post.handler";
import { adminGuardMiddlewareAuth } from "../../auth/middlewares/admin-guard.middleware";
import { postBodyInputValidationMiddleware } from "../validations/post-input-dto-validation.middleware";
import { updatePostHandler } from "./handlers/update-post.handler";
import { deletePostHandler } from "./handlers/delete-post.handler";

export const postsRoute = Router({});

postsRoute.get("", getPostListHandler);
postsRoute.get(
  "/:id",
  paramIdMiddlewareValidation,
  inputValidationResultMiddleware,
  getPostHandler
);

postsRoute.post(
  "",
  adminGuardMiddlewareAuth,
  postBodyInputValidationMiddleware,
  inputValidationResultMiddleware,
  createNewPostHandler
);

postsRoute.put(
  "/:id",
  adminGuardMiddlewareAuth,
  paramIdMiddlewareValidation,
  postBodyInputValidationMiddleware,
  inputValidationResultMiddleware,
  updatePostHandler
);

postsRoute.delete(
  "/:id",
  adminGuardMiddlewareAuth,
  paramIdMiddlewareValidation,
  inputValidationResultMiddleware,
  deletePostHandler
);
