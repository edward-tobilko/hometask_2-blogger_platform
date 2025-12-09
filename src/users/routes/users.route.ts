import { NextFunction, Request, Response, Router } from "express";
import { matchedData } from "express-validator";

import { getUsersListHandler } from "./http-handlers/get-users-list.handler";
import { queryPaginationAndSortingValidation } from "../../core/middlewares/validation/query-pagination-sorting.middleware-validation";
import { UserSortField } from "./request-payloads/user-sort-field.request-payload";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { adminGuardMiddlewareAuth } from "../../auth/routes/guards/admin-guard.middleware";
import { CreateUserRequestPayload } from "./request-payloads/create-user.request-payload";
import { HTTP_STATUS_CODES } from "../../core/utils/http-status-codes.util";
import { createCommand } from "../../core/helpers/create-command.helper";
import { CreateUserDtoCommand } from "../applications/commands/user-dto.commands";
import { userService } from "../applications/user.service";

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
  async (
    req: Request<{}, {}, CreateUserRequestPayload, {}>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // const { email, login, password } = req.body;

      const sanitizedBodyParam = matchedData<CreateUserRequestPayload>(req, {
        locations: ["body"],
        includeOptionals: true,
      });

      const command = createCommand<CreateUserDtoCommand>(sanitizedBodyParam);

      const createdUserOutput = await userService.createUser(command);

      res.status(HTTP_STATUS_CODES.CREATED_201).json(createdUserOutput);
    } catch (error: unknown) {
      res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);

      next(error);
    }
  }
);

// ? Request<Params, ResBody, ReqBody, Query>
