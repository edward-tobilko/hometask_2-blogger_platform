import { Router } from "express";

import { adminGuardMiddlewareAuth } from "../../auth/middlewares/admin-guard.middleware";
import { paramIdMiddlewareValidation } from "../../core/middlewares/validation/param-id-validation.middleware";
import { inputValidationResultMiddleware } from "../../core/middlewares/validation/input-validation-result.middleware";
import { blogBodyInputValidationMiddleware } from "../validations/blog-dto-input-validation.middleware";
import { getBlogListHandler } from "./handlers/get-blog-list.handler";
import { getBlogByIdHandler } from "./handlers/get-blog.handler";
import { createNewBlogHandler } from "./handlers/create-blog.handler";
import { updateBlogHandler } from "./handlers/update-blog.handler";
import { deleteBlogHandler } from "./handlers/delete-blog.handler";

export const blogsRoute = Router({});

blogsRoute.get("", getBlogListHandler);

blogsRoute.get(
  "/:id",
  paramIdMiddlewareValidation,
  inputValidationResultMiddleware,
  getBlogByIdHandler
);

blogsRoute.post(
  "",
  adminGuardMiddlewareAuth,
  blogBodyInputValidationMiddleware,
  inputValidationResultMiddleware,
  createNewBlogHandler
);

blogsRoute.put(
  "/:id",
  adminGuardMiddlewareAuth,
  paramIdMiddlewareValidation,
  blogBodyInputValidationMiddleware,
  inputValidationResultMiddleware,
  updateBlogHandler
);

blogsRoute.delete(
  "/:id",
  adminGuardMiddlewareAuth,
  paramIdMiddlewareValidation,
  inputValidationResultMiddleware,
  deleteBlogHandler
);
