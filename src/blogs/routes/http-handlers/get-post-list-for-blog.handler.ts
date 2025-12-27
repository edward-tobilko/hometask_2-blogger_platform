import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { log } from "node:console";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-pagination.helper";
import { blogsQueryService } from "../../application/blog-query.service";
import { PostSortFieldRP } from "../../../posts/routes/request-payload-types/post-sort-field.request-payload-types";
import { PostsListRP } from "../../../posts/routes/request-payload-types/posts-list.request-payload-types";
import { RepositoryNotFoundError } from "../../../core/errors/application.error";

export async function getPostListForBlogHandler(
  req: Request<{ id: string }, {}, PostsListRP, {}>,
  res: Response
) {
  try {
    const sanitizedQueryParam = matchedData<PostsListRP>(req, {
      locations: ["query"],
      includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
    });

    const queryParamInput = {
      ...setDefaultSortAndPaginationIfNotExist<PostSortFieldRP>(
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
      errorsMessages: [
        { message: "Internal Server Error", field: "query params" },
      ],
    });
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
