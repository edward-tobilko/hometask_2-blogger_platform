import { Router } from "express";

import { getPostListHandler } from "./handlers/post-handlers/get-post-list.handler";
import { getPostHandler } from "./handlers/post-handlers/get-post.handler";
import { paramIdMiddlewareValidation } from "../../core/middlewares/validations/param-id-validation.middleware";
import { inputValidationResultMiddleware } from "../../core/middlewares/validations/input-validation-result.middleware";
import { createNewPostHandler } from "./handlers/post-handlers/create-post.handler";
import { adminGuardMiddlewareAuth } from "../../auth/admin-guard.middleware";
import { postBodyInputValidationMiddleware } from "../../core/middlewares/validations/post-body-input-validation.middleware";

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
