import { NextFunction, Request, Response } from "express";
import { matchedData } from "express-validator";
import { log } from "node:console";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-pagination.helper";
import { blogsQueryService } from "../../application/blog-query.service";
import { BlogSortFieldRP } from "../request-payload-types/blog-sort-field.request-payload-type";
import { BlogsListRP } from "../request-payload-types/blogs-list.request-payload-type";

export async function getBlogListHandler(
  req: Request<{}, {}, {}, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const sanitizedQueryParam = matchedData<BlogsListRP>(req, {
      locations: ["query"],
      includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
    });

    const queryParamInput =
      setDefaultSortAndPaginationIfNotExist<BlogSortFieldRP>(
        sanitizedQueryParam
      );

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
