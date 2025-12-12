import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { log } from "node:console";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-pagination.helper";
import { BlogsListRequestPayload } from "../request-payloads/blogs-list.request-payload";
import { BlogSortField } from "../request-payloads/blog-sort-field.request-payload";
import { blogsQueryService } from "../../application/blog-query.service";
import { RepositoryNotFoundError } from "../../../core/errors/repository-not-found.error";

export async function getPostListForBlogHandler(
  req: Request<{ id: string }, {}, BlogsListRequestPayload, {}>,
  res: Response
) {
  try {
    const sanitizedQueryParam = matchedData<BlogsListRequestPayload>(req, {
      locations: ["query"],
      includeOptionals: true,
    });

    const queryParamInput = {
      ...setDefaultSortAndPaginationIfNotExist<BlogSortField>(
        sanitizedQueryParam
      ),
      blogId: req.params.id,
    };

    const postsListByBlogOutput =
      await blogsQueryService.getPostsListByBlog(queryParamInput);

    log(
      `Post list for blog ${postsListByBlogOutput.page}/${postsListByBlogOutput.pagesCount} - items: ${postsListByBlogOutput.items.length} - total: ${postsListByBlogOutput.totalCount}`
    );

    res.status(HTTP_STATUS_CODES.OK_200).json(postsListByBlogOutput);
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundError) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json({
        errorsMessages: [{ message: (error as Error).message, field: "id" }], // получаем ошибку "Blog is not exist!"" из репозитория findAllPostsForBlogQueryRepo -> throw new RepositoryNotFoundError("Blog is not exist!");
      });
    }

    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
      errorsMessages: [{ message: "Internal Server Error", field: "id" }],
    });
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
