import { NextFunction, Request, Response } from "express";
import { matchedData } from "express-validator";
import { log } from "node:console";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-pagination.helper";
import { blogsQueryService } from "../../application/blog-query.service";
import { BlogsListRequestPayload } from "../request-payloads/blogs-list.request-payload";
import { BlogSortField } from "../request-payloads/blog-sort-field.request-payload";

export async function getBlogListHandler(
  req: Request<{}, {}, {}, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const sanitizedQueryParam = matchedData<BlogsListRequestPayload>(req, {
      locations: ["query"],
      // includeOptionals: true,
    });

    const queryParamInput =
      setDefaultSortAndPaginationIfNotExist<BlogSortField>(sanitizedQueryParam);

    const blogsListOutput =
      await blogsQueryService.getBlogsList(queryParamInput);

    log(
      `Blogs page ${blogsListOutput.page}/${blogsListOutput.pagesCount} - items: ${blogsListOutput.items.length} - total: ${blogsListOutput.totalCount}`
    );

    res.status(HTTP_STATUS_CODES.OK_200).json(blogsListOutput);
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
