import { NextFunction, Request, Response } from "express";
import { matchedData } from "express-validator";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-pagination.helper";
import { PostsListRequestPayload } from "../request-payloads/posts-list.request-payload";
import { postQueryService } from "../../application/post-query-service";
import { PostSortField } from "../request-payloads/post-sort-field.request-payload";

export async function getPostListHandler(
  req: Request<{}, {}, {}, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const sanitizedQueryParam = matchedData<PostsListRequestPayload>(req, {
      locations: ["query"],
      includeOptionals: true,
    });

    const queryParam =
      setDefaultSortAndPaginationIfNotExist<PostSortField>(sanitizedQueryParam);

    const postsListOutput = await postQueryService.getPosts(queryParam);

    res.status(HTTP_STATUS_CODES.OK_200).json(postsListOutput);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);

    next(error);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
