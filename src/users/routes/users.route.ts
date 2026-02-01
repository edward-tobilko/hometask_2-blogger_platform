import { Router } from "express";
import { query } from "express-validator";

import { queryPaginationAndSortingValidation } from "../../core/middlewares/validation/query-pagination-sorting.middleware-validation";
import { UserSortFieldRP } from "./request-payload-types/user-sort-field.request-payload-types";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { baseAuthGuard } from "../../auth/api/guards/base-auth.guard";
import { createUserDtoMiddlewareValidations } from "./middleware-validations/create-user-dto.middleware-validation";
import { paramIdValidation } from "../../core/middlewares/validation/param-id.middleware-validation";
import { usersController } from "composition-root";

export const usersRoute = Router({});

// * GET: Returns all users
usersRoute.get(
  "",
  baseAuthGuard,
  queryPaginationAndSortingValidation<UserSortFieldRP>(UserSortFieldRP),
  query("searchLoginTerm").optional({ checkFalsy: true }).isString().trim(),
  query("searchEmailTerm").optional({ checkFalsy: true }).isString().trim(),

  inputResultMiddlewareValidation,

  usersController.getUsersListHandler.bind(usersController)
);

// * POST: Add new user to the system
usersRoute.post(
  "",
  baseAuthGuard,
  createUserDtoMiddlewareValidations,
  inputResultMiddlewareValidation,

  usersController.createUserHandler.bind(usersController)
);

// * DELETE: Delete user specified by id
usersRoute.delete(
  "/:id",
  baseAuthGuard,
  paramIdValidation,
  inputResultMiddlewareValidation,

  usersController.deleteUserHandler.bind(usersController)
);

// ? Если мы не вызываем метод класса, а передаем его как свойство (через точку и без скобок), то этот метод теряет контекст класса usersController, и что бы этого не было, нам нужно забиндить все методы этого класса (.bind(usersController)).
