import { Router } from "express";

import { getPostListHandler } from "./http-handlers/get-post-list.handler";
import { getPostHandler } from "./http-handlers/get-post.handler";
import {
  paramIdValidation,
  paramPostIdValidation,
} from "../../core/middlewares/validation/param-id.middleware-validation";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { baseAuthGuard } from "../../auth/api/guards/base-auth.guard";
import { deletePostHandler } from "./http-handlers/delete-post.handler";
import { queryPaginationAndSortingValidation } from "../../core/middlewares/validation/query-pagination-sorting.middleware-validation";
import {
  PostCommentsSortFieldRP,
  PostSortFieldRP,
} from "./request-payload-types/post-sort-field.request-payload-types";
import { updatePostHandler } from "./http-handlers/update-post.handler";
import { jwtAccessAuthGuard } from "../../auth/api/guards/jwt-access-auth.guard";
import { getPostCommentsHandler } from "./http-handlers/get-post-comments.handler";
import { createCommentDtoRPValidation } from "./request-payload-validations/create-comment-dto.validation";
import { postBodyInputRPValidation } from "./request-payload-validations/post-input-dto-validation.middleware";
import { PostsController } from "./posts.controller";
import { createCommentHandler } from "./http-handlers/create-comment.handler";

export const createPostsRouter = (postsController: PostsController) => {
  const postsRoute = Router({});

  // * GET: Returns all posts
  postsRoute.get(
    "",
    queryPaginationAndSortingValidation<PostSortFieldRP>(PostSortFieldRP),
    inputResultMiddlewareValidation,
    getPostListHandler
  );

  // * GET: Return post by id
  postsRoute.get(
    "/:id",
    paramIdValidation,
    inputResultMiddlewareValidation,
    getPostHandler
  );

  // * GET: Returns comments for specified post
  postsRoute.get(
    "/:postId/comments",
    paramPostIdValidation,
    queryPaginationAndSortingValidation<PostCommentsSortFieldRP>(
      PostCommentsSortFieldRP
    ),
    inputResultMiddlewareValidation,
    getPostCommentsHandler
  );

  // * POST: Create new post
  postsRoute.post(
    "",
    baseAuthGuard,
    postBodyInputRPValidation,
    inputResultMiddlewareValidation,

    postsController.createCommentHandler
  );

  // * POST: Create new comment
  postsRoute.post(
    "/:postId/comments",
    jwtAccessAuthGuard,
    createCommentDtoRPValidation,
    inputResultMiddlewareValidation,
    createCommentHandler
  );

  // * PUT: Update existing post by id with input model
  postsRoute.put(
    "/:id",
    baseAuthGuard,
    paramIdValidation,
    postBodyInputRPValidation,
    inputResultMiddlewareValidation,
    updatePostHandler
  );

  // * DELETE: Delete post specified by id
  postsRoute.delete(
    "/:id",
    baseAuthGuard,
    paramIdValidation,
    inputResultMiddlewareValidation,
    deletePostHandler
  );

  return postsRoute;
};

// ? Если мы не вызываем метод класса, а передаем его как свойство (через точку и без скобок), то этот метод теряет контекст класса postsController, и что бы этого не было, нам нужно забиндить все методы этого класса (.bind(postsController)).

// ? Или же мы можем воспользоваться arrow func, что бы не биндить: Если в контроллере метод объявлен так: getUsersListHandler = async (req, res) => { ... } то он автоматически «захватывает» this из инстанса класса. И тогда можно передавать так: usersController.getUsersListHandler и контекст не потеряется, но если метод объявлен через обычную ф-ю (async getUsersListHandler(req, res) { ... }), то нужно биндить.
