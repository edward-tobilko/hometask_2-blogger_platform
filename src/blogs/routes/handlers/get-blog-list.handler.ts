import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { log } from "node:console";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import {
  BlogListPaginatedOutput,
  BlogQueryParamInput,
} from "../../types/blog.types";
import { mapToBlogsListOutputUtil } from "../mappers/map-to-blogs-list-output.util";
import { blogsService } from "../../application/blogs-service";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-pagination.helper";

export async function getBlogListHandler(
  req: Request<{}, {}, BlogQueryParamInput>,
  res: Response<BlogListPaginatedOutput>
) {
  try {
    const sanitizedQueryParam = matchedData<BlogQueryParamInput>(req, {
      locations: ["query"],
      includeOptionals: true,
    });

    const queryParamInput =
      setDefaultSortAndPaginationIfNotExist(sanitizedQueryParam);

    const { items, totalCount } =
      await blogsService.findAllBlogs(queryParamInput);

    log(
      `Blogs: ${items.map((item) => item.name)} - Total: ${totalCount.toString()}`
    );

    const blogsListOutput = mapToBlogsListOutputUtil(items, {
      page: queryParamInput.pageNumber,
      pageSize: queryParamInput.pageSize,
      totalCount,
    });

    res.status(HTTP_STATUS_CODES.OK_200).json(blogsListOutput);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
