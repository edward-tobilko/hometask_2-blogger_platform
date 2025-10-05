import { Router } from "express";

import { getPostListHandler } from "./handlers/get-post-list.handler";
import { getPostHandler } from "./handlers/get-post.handler";
import { paramIdMiddlewareValidation } from "../../core/middlewares/validations/param-id-validation.middleware";
import { inputValidationResultMiddleware } from "../../core/middlewares/validations/input-validation-result.middleware";
import { createNewPostHandler } from "./handlers/create-post.handler";
import { adminGuardMiddlewareAuth } from "../../auth/admin-guard.middleware";
import { postBodyInputValidationMiddleware } from "../validations/post-body-input-validation.middleware";
import { updatePostHandler } from "./handlers/update-post.handler";
import { deletePostHandler } from "./handlers/delete-post.handler";

export const postsRouter = Router({});

postsRouter.get("", getPostListHandler);
postsRouter.get(
  "/:id",
  paramIdMiddlewareValidation,
  inputValidationResultMiddleware,
  getPostHandler
);

postsRouter.post(
  "",
  adminGuardMiddlewareAuth,
  postBodyInputValidationMiddleware,
  inputValidationResultMiddleware,
  createNewPostHandler
);

postsRouter.put(
  "/:id",
  adminGuardMiddlewareAuth,
  paramIdMiddlewareValidation,
  postBodyInputValidationMiddleware,
  inputValidationResultMiddleware,
  updatePostHandler
);

postsRouter.delete(
  "/:id",
  adminGuardMiddlewareAuth,
  paramIdMiddlewareValidation,
  inputValidationResultMiddleware,
  deletePostHandler
);
