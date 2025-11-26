import { Router } from "express";

import { getUsersListHandler } from "./http-handlers/get-users-list.handler";
import { queryPaginationAndSortingValidation } from "../../core/middlewares/validation/query-pagination-sorting.middleware-validation";
import { UserSortField } from "./request-payloads/user-sort-field.request-payload";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { adminGuardMiddlewareAuth } from "../../auth/routes/guards/admin-guard.middleware";

export const usersRoute = Router({});

usersRoute.get(
  "",
  adminGuardMiddlewareAuth,
  queryPaginationAndSortingValidation(UserSortField),
  inputResultMiddlewareValidation,
  getUsersListHandler
);
