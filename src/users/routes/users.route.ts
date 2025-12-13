import { Router } from "express";
import { query } from "express-validator";

import { getUsersListHandler } from "./http-handlers/get-users-list.handler";
import { queryPaginationAndSortingValidation } from "../../core/middlewares/validation/query-pagination-sorting.middleware-validation";
import { UserSortField } from "./request-payloads/user-sort-field.request-payload";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { adminGuardMiddlewareAuth } from "../../auth/routes/guards/admin-guard.middleware";
import { createUserDtoMiddlewareValidations } from "./middleware-validations/create-user-dto.middleware-validation";
import { createUserHandler } from "./http-handlers/create-user.handler";
import { deleteUserHandler } from "./http-handlers/delete-user.handler";
import { paramIdValidation } from "../../core/middlewares/validation/param-id.middleware-validation";

export const usersRoute = Router({});

usersRoute.get(
  "",
  adminGuardMiddlewareAuth,
  queryPaginationAndSortingValidation<UserSortField>(UserSortField),
  query("searchLoginTerm")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Search login term must be non empty string"),

  query("searchEmailTerm")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Search email term must be non empty string"),

  inputResultMiddlewareValidation,
  getUsersListHandler
);

usersRoute.post(
  "",
  adminGuardMiddlewareAuth,
  createUserDtoMiddlewareValidations,
  inputResultMiddlewareValidation,
  createUserHandler
);

usersRoute.delete(
  "/:id",
  adminGuardMiddlewareAuth,
  paramIdValidation,
  inputResultMiddlewareValidation,
  deleteUserHandler
);
