import { Router } from "express";

import { adminGuardMiddlewareAuth } from "../../auth/admin-guard.middleware";
import { paramIdMiddlewareValidation } from "../../core/middlewares/validations/param-id-validation.middleware";
import { inputValidationResultMiddleware } from "../../core/middlewares/validations/input-validation-result.middleware";
import { blogBodyInputValidationMiddleware } from "../validations/blog-body-input-validation.middleware";

export const blogsRouter = Router({});

blogsRouter.get("", getBlogListHandler);

blogsRouter.get(
  "/:id",
  paramIdMiddlewareValidation,
  inputValidationResultMiddleware,
  getBlogByIdHandler
);

blogsRouter.post(
  "",
  adminGuardMiddlewareAuth,
  blogBodyInputValidationMiddleware,
  inputValidationResultMiddleware,
  createNewBlogHandler
);

blogsRouter.put(
  "/:id",
  adminGuardMiddlewareAuth,
  paramIdMiddlewareValidation,
  blogBodyInputValidationMiddleware,
  inputValidationResultMiddleware,
  updateBlogHandler
);

blogsRouter.delete(
  "/:id",
  adminGuardMiddlewareAuth,
  paramIdMiddlewareValidation,
  inputValidationResultMiddleware,
  deleteBlogHandler
);
