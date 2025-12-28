import { NextFunction, Request, Response } from "express";
import { matchedData } from "express-validator";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-pagination.helper";
import { PostsListRP } from "../request-payload-types/posts-list.request-payload-types";
import { postQueryService } from "../../application/post-query-service";
import { PostSortFieldRP } from "../request-payload-types/post-sort-field.request-payload-types";

export async function getPostListHandler(
  req: Request<{}, {}, {}, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const sanitizedQueryParam = matchedData<PostsListRP>(req, {
      locations: ["query"],
      includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
    });

    const queryParam =
      setDefaultSortAndPaginationIfNotExist<PostSortFieldRP>(
        sanitizedQueryParam
      );

    const postsListOutput = await postQueryService.getPosts(queryParam);

    res.status(HTTP_STATUS_CODES.OK_200).json(postsListOutput);
  } catch (error: unknown) {
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
      errorsMessages: [
        { message: "Internal Server Error", field: "query params" },
      ],
    });

    next(error);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
