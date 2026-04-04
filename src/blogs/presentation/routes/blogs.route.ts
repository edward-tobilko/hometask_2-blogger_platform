import { Router } from "express";
import { query } from "express-validator";

import { inputResultMiddlewareValidation } from "@core/middlewares/validation/input-result.middleware-validation";
import { queryPaginationAndSortingValidation } from "@core/middlewares/validation/query-pagination-sorting.middleware-validation";
import { BlogSortFieldRP } from "../request-payload-types/blog-sort-field.request-payload-type";
import { createBlogDtoRPValidation } from "../request-payload-validations/create-blog-dto.request-payload-validation";
import { createPostForBlogDtoRPValidation } from "../request-payload-validations/create-post-for-blog-dto.request-payload-validation";
import {
  blogIdValidation,
  paramIdValidation,
} from "@core/middlewares/validation/param-id.middleware-validation";
import { updateBlogDtoRPValidation } from "../request-payload-validations/update-blog-dto.request-payload-validation";
import { PostSortFieldRP } from "@posts/presentation/request-payload-types/post-sort-field.request-payload-types";
import { BlogsController } from "../controllers/blogs.controller";
import { baseAuthGuard } from "@auth/presentation/guards/base-auth.guard";
import { optionalJwtAccessGuard } from "@auth/presentation/guards/optional-jwt-access-auth.guard";
import { IJWTService } from "@auth/application/interfaces/jwt-service.interface";

export const createBlogsRouter = (
  blogsController: BlogsController,
  jwtService: IJWTService
) => {
  const blogsRoute = Router({});

  // * GET: Returns blogs with paging
  blogsRoute.get(
    "",
    queryPaginationAndSortingValidation<BlogSortFieldRP>(BlogSortFieldRP),
    query("searchNameTerm")
      .customSanitizer((queryValue: unknown) =>
        typeof queryValue === "string" ? queryValue.trim() : queryValue
      )
      .optional({ checkFalsy: true })
      .isString(),

    inputResultMiddlewareValidation,

    blogsController.getBlogsListHandler.bind(blogsController)
  );

  // * GET: Returns blog by id
  blogsRoute.get(
    "/:id",
    paramIdValidation,
    inputResultMiddlewareValidation,

    blogsController.getBlogByIdHandler.bind(blogsController)
  );

  // * GET: Returns all posts for specified blog
  blogsRoute.get(
    "/:id/posts",
    optionalJwtAccessGuard(jwtService), // * Получаем токен для передачи userId для вычисления динамического myStatus
    paramIdValidation,
    queryPaginationAndSortingValidation<PostSortFieldRP>(PostSortFieldRP),
    inputResultMiddlewareValidation,

    blogsController.getPostsListForBlogHandler.bind(blogsController)
  );

  // * POST: Create new blog
  blogsRoute.post(
    "",
    baseAuthGuard,
    createBlogDtoRPValidation,
    inputResultMiddlewareValidation,

    blogsController.createBlogHandler.bind(blogsController)
  );

  // * POST: Create new post for specific blog
  blogsRoute.post(
    "/:id/posts",
    baseAuthGuard,
    blogIdValidation,
    createPostForBlogDtoRPValidation,
    inputResultMiddlewareValidation,

    blogsController.createPostForBlogHandler.bind(blogsController)
  );

  // * PUT: Update existing blog by id with input model
  blogsRoute.put(
    "/:id",
    baseAuthGuard,
    paramIdValidation,
    updateBlogDtoRPValidation,
    inputResultMiddlewareValidation,

    blogsController.updateBlogHandler.bind(blogsController)
  );

  // * DELETE: Delete blog specified by id
  blogsRoute.delete(
    "/:id",
    baseAuthGuard,
    paramIdValidation,
    inputResultMiddlewareValidation,

    blogsController.deleteBlogHandler.bind(blogsController)
  );

  return blogsRoute;
};
