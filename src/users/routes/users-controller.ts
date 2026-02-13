import { Request, Response, NextFunction } from "express";
import { matchedData } from "express-validator";
import { inject, injectable } from "inversify";

import { CreateUserRP } from "./request-payload-types/create-user.request-payload-types";
import { errorsHandler } from "@core/errors/errors-handler.error";
import { createCommand } from "@core/helpers/create-command.helper";
import { CreateUserDtoCommand } from "users/applications/commands/user-dto.commands";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { setDefaultSortAndPaginationIfNotExist } from "@core/helpers/set-default-sort-pagination.helper";
import { UsersListRP } from "./request-payload-types/get-users-list.request-payload-types";
import { UserSortFieldRP } from "./request-payload-types/user-sort-field.request-payload-types";
import { mapApplicationStatusToHttpStatus } from "@core/result/map-app-status-to-http.result";
import { Types } from "@core/di/types";
import { IUsersService } from "users/interfaces/IUsersService";
import { IUsersQueryService } from "users/interfaces/IUsersQueryService";

@injectable()
export class UsersController {
  constructor(
    @inject(Types.IUsersService) private usersService: IUsersService,
    @inject(Types.IUsersQueryService)
    private usersQueryService: IUsersQueryService
  ) {}

  async createUserHandler(
    req: Request<{}, {}, CreateUserRP, {}>,
    res: Response
  ) {
    try {
      const sanitizedBodyParam = matchedData<CreateUserRP>(req, {
        locations: ["body"],
        includeOptionals: false,
      });

      const command = createCommand<CreateUserDtoCommand>(sanitizedBodyParam);

      const createdUserOutput = await this.usersService.createUser(command);

      res.status(HTTP_STATUS_CODES.CREATED_201).json(createdUserOutput.data);
    } catch (error: unknown) {
      console.error("ERROR:", error);

      errorsHandler(error, req, res);
    }
  }

  async getUsersListHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const sanitizedQueryParam = matchedData(req, {
        locations: ["query"],
        includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
      }) as UsersListRP;

      const queryParamData =
        setDefaultSortAndPaginationIfNotExist<UserSortFieldRP>(
          sanitizedQueryParam
        );

      const usersListOutput =
        await this.usersQueryService.getUsersList(queryParamData);

      res.status(HTTP_STATUS_CODES.OK_200).json(usersListOutput);
    } catch (error: unknown) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
        errorsMessages: [
          { message: "Internal Server Error", field: "query params" },
        ],
      });

      next(error);
    }
  }

  async deleteUserHandler(req: Request<{ id: string }>, res: Response) {
    try {
      const command = createCommand<{ id: string }>({ id: req.params.id });

      const result = await this.usersService.deleteUser(command);

      if (!result.isSuccess()) {
        return res
          .status(mapApplicationStatusToHttpStatus(result.status))
          .json({ errorsMessages: result.extensions });
      }

      res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } catch (error: unknown) {
      console.error("ERROR:", error);

      errorsHandler(error, req, res);
    }
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
