import { Router } from "express";
import { body } from "express-validator";

import {
  paramIdValidation,
  paramPostIdValidation,
} from "../../../core/middlewares/validation/param-id.middleware-validation";
import { inputResultMiddlewareValidation } from "../../../core/middlewares/validation/input-result.middleware-validation";
import { baseAuthGuard } from "../../../auth/presentation/guards/base-auth.guard";
import { queryPaginationAndSortingValidation } from "../../../core/middlewares/validation/query-pagination-sorting.middleware-validation";
import {
  PostCommentsSortFieldRP,
  PostSortFieldRP,
} from "../request-payload-types/post-sort-field.request-payload-types";
import { jwtAccessAuthGuard } from "../../../auth/presentation/guards/jwt-access-auth.guard";
import { createCommentDtoRPValidation } from "../request-payload-validations/create-comment-dto.validation";
import { PostsController } from "./posts.controller";
import { createPostBodyInputRPValidation } from "../request-payload-validations/post-input-dto-validation.middleware";
import { IBlogsQueryService } from "blogs/application/interfaces/blogs-query-service.interface";
import { IJWTService } from "auth/application/interfaces/jwt-service.interface";
import { optionalJwtAccessGuard } from "auth/presentation/guards/optional-jwt-access-auth.guard";
import { LikeStatus } from "@core/types/like-status.enum";
import { ISessionQueryRepo } from "auth/application/interfaces/session-query-repo.interface";

export const createPostsRouter = (
  postsController: PostsController,
  blogsQueryService: IBlogsQueryService,
  jwtService: IJWTService,
  sessionQueryRepository: ISessionQueryRepo
) => {
  const postsRoute = Router({});

  // * PUT: Make like / unlike / dislike / undislike operation.
  postsRoute.put(
    "/:postId/like-status",
    jwtAccessAuthGuard(jwtService, sessionQueryRepository),
    paramPostIdValidation,

    body("likeStatus")
      .isString()
      .withMessage("likeStatus should be a string")
      .bail()
      .custom((value: string) =>
        Object.values(LikeStatus).includes(value as LikeStatus)
      )
      .withMessage("likeStatus must be one of: None, Like, Dislike"),
    inputResultMiddlewareValidation,

    postsController.updatePostLikeStatusHandler
  );

  // * GET: Returns comments for specified post
  postsRoute.get(
    "/:postId/comments",
    optionalJwtAccessGuard(jwtService), // * Получаем токен для передачи userId для вычисления динамического myStatus
    paramPostIdValidation,
    queryPaginationAndSortingValidation<PostCommentsSortFieldRP>(
      PostCommentsSortFieldRP
    ),
    inputResultMiddlewareValidation,

    postsController.getPostCommentsHandler
  );

  // * POST: Create new comment
  postsRoute.post(
    "/:postId/comments",
    jwtAccessAuthGuard(jwtService, sessionQueryRepository),
    createCommentDtoRPValidation,
    inputResultMiddlewareValidation,

    postsController.createCommentHandler
  );

  // * GET: Returns all posts
  postsRoute.get(
    "",
    optionalJwtAccessGuard(jwtService),
    queryPaginationAndSortingValidation<PostSortFieldRP>(PostSortFieldRP),
    inputResultMiddlewareValidation,

    postsController.getPostsListHandler
  );

  // * POST: Create new post
  postsRoute.post(
    "",
    baseAuthGuard,
    createPostBodyInputRPValidation(blogsQueryService),
    inputResultMiddlewareValidation,

    postsController.createPostHandler
  );

  // * GET: Return post by id
  postsRoute.get(
    "/:id",
    optionalJwtAccessGuard(jwtService),
    paramIdValidation,
    inputResultMiddlewareValidation,

    postsController.getPostHandler
  );

  // * PUT: Update existing post by id with input model
  postsRoute.put(
    "/:id",
    baseAuthGuard,
    paramIdValidation,
    createPostBodyInputRPValidation(blogsQueryService),
    inputResultMiddlewareValidation,

    postsController.updatePostHandler
  );

  // * DELETE: Delete post specified by id
  postsRoute.delete(
    "/:id",
    baseAuthGuard,
    paramIdValidation,
    inputResultMiddlewareValidation,

    postsController.deletePostHandler
  );

  return postsRoute;
};

// ? Если мы не вызываем метод класса, а передаем его как свойство (через точку и без скобок), то этот метод теряет контекст класса postsController, и что бы этого не было, нам нужно забиндить все методы этого класса (.bind(postsController)).

// ? Или же мы можем воспользоваться arrow func, что бы не биндить: Если в контроллере метод объявлен так: getUsersListHandler = async (req, res) => { ... } то он автоматически «захватывает» this из инстанса класса. И тогда можно передавать так: usersController.getUsersListHandler и контекст не потеряется, но если метод объявлен через обычную ф-ю (async getUsersListHandler(req, res) { ... }), то нужно биндить.
