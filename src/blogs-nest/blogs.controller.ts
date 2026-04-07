import { Controller, Get, Req, Res } from "@nestjs/common";

import { routersPaths } from "@core/paths/paths";
import { matchedData } from "express-validator";
import type { Request, Response } from "express";

import { BlogsListRP } from "@blogs/presentation/request-payload-types/blogs-list.request-payload-type";
import { BlogSortFieldRP } from "@blogs/presentation/request-payload-types/blog-sort-field.request-payload-type";
import { setDefaultSortAndPaginationIfNotExist } from "@core/helpers/set-default-sort-pagination.helper";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

@Controller(routersPaths.blogs)
export class BlogsController {
  @Get()
  getBlogsListHandler(@Req() request: Request, @Res() response: Response) {
    try {
      const sanitizedQueryParam = matchedData<BlogsListRP>(request, {
        locations: ["query"],
        includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
      });

      const queryParamInput =
        setDefaultSortAndPaginationIfNotExist<BlogSortFieldRP>(
          sanitizedQueryParam
        );

      const blogsListOutput =
        this.blogsQueryService.getBlogsList(queryParamInput);

      return response.status(HTTP_STATUS_CODES.OK_200).json(blogsListOutput);
    } catch (error: unknown) {
      return response.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
        errorsMessages: [
          { message: "Internal Server Error", field: "query params" },
        ],
      });
    }
  }
}
