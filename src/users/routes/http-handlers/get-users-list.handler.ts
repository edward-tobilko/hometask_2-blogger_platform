import { NextFunction, Request, Response } from "express";
import { matchedData } from "express-validator";

import { UsersListRequestPayload } from "../request-payloads/get-users-list.request-payload";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-pagination.helper";
import { userQueryService } from "../../applications/users-query.service";
import { UserSortField } from "../request-payloads/user-sort-field.request-payload";

export const getUsersListHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sanitizedQueryParam = matchedData(req, {
      locations: ["query"],
      includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
    }) as UsersListRequestPayload;

    const queryParamData =
      setDefaultSortAndPaginationIfNotExist<UserSortField>(sanitizedQueryParam);

    const usersListOutput = await userQueryService.getUsersList(queryParamData);

    res.status(HTTP_STATUS_CODES.OK_200).json(usersListOutput);
  } catch (error: unknown) {
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
      errorsMessages: [
        { message: "Internal Server Error", field: "query params" },
      ],
    });

    next(error);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
