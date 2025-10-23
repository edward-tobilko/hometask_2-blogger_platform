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
import { paginationAndSortingValidation } from "../../core/middlewares/validation/query-pagination-sorting-validation.middleware";
import { BlogSortField } from "../types/blog.types";
import { createPostForBlogHandler } from "./handlers/create-post-for-blog.handler";
import { getPostListForBlogHandler } from "./handlers/get-post-list-for-blog.handler";
import { postForBlogDtoInputValidationMiddleware } from "../validations/post-for-blog-dto-input-validation.middleware";
import { PostSortField } from "../../posts/types/post.types";

export const blogsRoute = Router({});

// * GET methods
blogsRoute.get(
  "",
  paginationAndSortingValidation(BlogSortField),
  inputValidationResultMiddleware,
  getBlogListHandler
);

blogsRoute.get(
  "/:id",
  paramIdMiddlewareValidation,
  inputValidationResultMiddleware,
  getBlogByIdHandler
);

blogsRoute.get(
  "/:id/posts",
  paramIdMiddlewareValidation,
  paginationAndSortingValidation(PostSortField),
  inputValidationResultMiddleware,
  getPostListForBlogHandler
);

// * POST methods
blogsRoute.post(
  "",
  adminGuardMiddlewareAuth,
  blogBodyInputValidationMiddleware,
  inputValidationResultMiddleware,
  createNewBlogHandler
);

blogsRoute.post(
  "/:id/posts",
  adminGuardMiddlewareAuth,
  postForBlogDtoInputValidationMiddleware,
  inputValidationResultMiddleware,
  createPostForBlogHandler
);

// * PUT methods
blogsRoute.put(
  "/:id",
  adminGuardMiddlewareAuth,
  paramIdMiddlewareValidation,
  blogBodyInputValidationMiddleware,
  inputValidationResultMiddleware,
  updateBlogHandler
);

// * DELETE methods
blogsRoute.delete(
  "/:id",
  adminGuardMiddlewareAuth,
  paramIdMiddlewareValidation,
  inputValidationResultMiddleware,
  deleteBlogHandler
);
