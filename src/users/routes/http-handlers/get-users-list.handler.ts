import { NextFunction, Request, Response } from "express";
import { matchedData } from "express-validator";

import { UsersListRequestPayload } from "../request-payloads/get-users-list.request-payload";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-pagination.helper";
import { userQueryService } from "../../applications/users-query.service";

export const GetUsersListHandler = async (
  req: Request<{}, {}, {}, UsersListRequestPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const sanitizedQueryParam = matchedData<UsersListRequestPayload>(req, {
      locations: ["query"],
      includeOptionals: true,
    });

    const queryParam =
      setDefaultSortAndPaginationIfNotExist(sanitizedQueryParam);

    const usersListOutput = await userQueryService.getUsersList(queryParam);

    res.sendStatus(HTTP_STATUS_CODES.OK_200).json(usersListOutput);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);

    next(error);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
