import { Router } from "express";
import { query } from "express-validator";

import { getUsersListHandler } from "./http-handlers/get-users-list.handler";
import { queryPaginationAndSortingValidation } from "../../core/middlewares/validation/query-pagination-sorting.middleware-validation";
import { UserSortFieldRP } from "./request-payload-types/user-sort-field.request-payload-types";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { baseAuthGuard } from "../../auth/api/guards/base-auth.guard";
import { createUserDtoMiddlewareValidations } from "./middleware-validations/create-user-dto.middleware-validation";
import { createUserHandler } from "./http-handlers/create-user.handler";
import { deleteUserHandler } from "./http-handlers/delete-user.handler";
import { paramIdValidation } from "../../core/middlewares/validation/param-id.middleware-validation";

export const usersRoute = Router({});

usersRoute.get(
  "",
  baseAuthGuard,
  queryPaginationAndSortingValidation<UserSortFieldRP>(UserSortFieldRP),
  query("searchLoginTerm").optional({ checkFalsy: true }).isString().trim(),
  query("searchEmailTerm").optional({ checkFalsy: true }).isString().trim(),

  inputResultMiddlewareValidation,
  getUsersListHandler
);

usersRoute.post(
  "",
  baseAuthGuard,
  createUserDtoMiddlewareValidations,
  inputResultMiddlewareValidation,
  createUserHandler
);

usersRoute.delete(
  "/:id",
  baseAuthGuard,
  paramIdValidation,
  inputResultMiddlewareValidation,
  deleteUserHandler
);
