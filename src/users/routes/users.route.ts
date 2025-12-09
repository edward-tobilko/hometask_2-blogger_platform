import { Router } from "express";

import { getUsersListHandler } from "./http-handlers/get-users-list.handler";
import { queryPaginationAndSortingValidation } from "../../core/middlewares/validation/query-pagination-sorting.middleware-validation";
import { UserSortField } from "./request-payloads/user-sort-field.request-payload";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { adminGuardMiddlewareAuth } from "../../auth/routes/guards/admin-guard.middleware";
import { createUserDtoRequestPayloadValidations } from "./request-payload-validations/create-user-dto.request-payload-validation";
import { createUserHandler } from "./http-handlers/create-user.handler";
import { deleteUserHandler } from "./http-handlers/delete-user.handler";
import { paramIdValidation } from "../../core/middlewares/validation/param-id.middleware-validation";

export const usersRoute = Router({});

usersRoute.get(
  "",
  adminGuardMiddlewareAuth,
  queryPaginationAndSortingValidation(UserSortField),
  inputResultMiddlewareValidation,
  getUsersListHandler
);

usersRoute.post(
  "",
  adminGuardMiddlewareAuth,
  createUserDtoRequestPayloadValidations,
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
