import { Router } from "express";

import { adminGuardMiddlewareAuth } from "../../auth/middlewares/admin-guard.middleware";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { getBlogListHandler } from "./http-handlers/get-blog-list.handler";
import { getBlogByIdHandler } from "./http-handlers/get-blog.handler";
// import { createNewBlogHandler } from "./http-handlers/create-blog.handler";
// import { updateBlogHandler } from "./http-handlers/update-blog.handler";
// import { deleteBlogHandler } from "./http-handlers/delete-blog.handler";
import { queryPaginationAndSortingValidation } from "../../core/middlewares/validation/query-pagination-sorting.middleware-validation";
// import { createPostForBlogHandler } from "./http-handlers/create-post-for-blog.handler";
import { getPostListForBlogHandler } from "./http-handlers/get-post-list-for-blog.handler";
import { BlogSortField } from "./request-payloads/blog-sort-field.request-payload";
import { createBlogDtoRequestPayloadValidation } from "./request-payload-validations/create-blog-dto.request-payload-validation";
import { createPostForBlogDtoRequestPayloadValidation } from "./request-payload-validations/create-post-for-blog-dto.request-payload-validation";
import { paramIdValidation } from "../../core/middlewares/validation/param-id.middleware-validation";
import { updateBlogDtoRequestPayloadValidation } from "./request-payload-validations/update-blog-dto.request-payload-validation";
import { PostSortField } from "../../posts/routes/request-payloads/post-sort-field.request-payload";

export const blogsRoute = Router({});

// * GET methods
blogsRoute.get(
  "",
  queryPaginationAndSortingValidation(BlogSortField),
  inputResultMiddlewareValidation,
  getBlogListHandler
);

blogsRoute.get(
  "/:id",
  paramIdValidation,
  inputResultMiddlewareValidation,
  getBlogByIdHandler
);

blogsRoute.get(
  "/:id/posts",
  paramIdValidation,
  queryPaginationAndSortingValidation(PostSortField),
  inputResultMiddlewareValidation,
  getPostListForBlogHandler
);

// * POST methods
blogsRoute.post(
  "",
  adminGuardMiddlewareAuth,
  createBlogDtoRequestPayloadValidation,
  inputResultMiddlewareValidation
  // createNewBlogHandler
);

blogsRoute.post(
  "/:id/posts",
  adminGuardMiddlewareAuth,
  createPostForBlogDtoRequestPayloadValidation,
  inputResultMiddlewareValidation
  // createPostForBlogHandler
);

// * PUT methods
blogsRoute.put(
  "/:id",
  adminGuardMiddlewareAuth,
  paramIdValidation,
  updateBlogDtoRequestPayloadValidation,
  inputResultMiddlewareValidation
  // updateBlogHandler
);

// * DELETE methods
blogsRoute.delete(
  "/:id",
  adminGuardMiddlewareAuth,
  paramIdValidation,
  inputResultMiddlewareValidation
  // deleteBlogHandler
);
