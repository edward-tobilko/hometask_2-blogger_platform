import { Router } from "express";
import { query } from "express-validator";

import { baseAuthGuard } from "../../auth/api/guards/base.guard";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { getBlogListHandler } from "./http-handlers/get-blog-list.handler";
import { getBlogByIdHandler } from "./http-handlers/get-blog.handler";
import { createNewBlogHandler } from "./http-handlers/create-blog.handler";
import { updateBlogHandler } from "./http-handlers/update-blog.handler";
import { deleteBlogHandler } from "./http-handlers/delete-blog.handler";
import { queryPaginationAndSortingValidation } from "../../core/middlewares/validation/query-pagination-sorting.middleware-validation";
import { createPostForBlogHandler } from "./http-handlers/create-post-for-blog.handler";
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
  queryPaginationAndSortingValidation<BlogSortField>(BlogSortField),
  query("searchNameTerm")
    .customSanitizer((queryValue: unknown) =>
      typeof queryValue === "string" ? queryValue.trim() : queryValue
    )
    .optional({ checkFalsy: true })
    .isString(),

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
  queryPaginationAndSortingValidation<PostSortField>(PostSortField),
  inputResultMiddlewareValidation,
  getPostListForBlogHandler
);

// * POST methods
blogsRoute.post(
  "",
  baseAuthGuard,
  createBlogDtoRequestPayloadValidation,
  inputResultMiddlewareValidation,
  createNewBlogHandler
);

blogsRoute.post(
  "/:id/posts",
  baseAuthGuard,
  createPostForBlogDtoRequestPayloadValidation,
  inputResultMiddlewareValidation,
  createPostForBlogHandler
);

// * PUT methods
blogsRoute.put(
  "/:id",
  baseAuthGuard,
  paramIdValidation,
  updateBlogDtoRequestPayloadValidation,
  inputResultMiddlewareValidation,
  updateBlogHandler
);

// * DELETE methods
blogsRoute.delete(
  "/:id",
  baseAuthGuard,
  paramIdValidation,
  inputResultMiddlewareValidation,
  deleteBlogHandler
);
