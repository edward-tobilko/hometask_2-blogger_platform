import { Request, Response } from "express";
import { matchedData } from "express-validator";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { postsService } from "../../application/posts-service";
import {
  PostForBlogListPaginatedOutput,
  PostQueryParamInput,
} from "../../types/post.types";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-pagination.helper";
import { mapToPostListOutputUtil } from "../mappers/map-to-post-list-output.util";

export async function getPostListHandler(
  req: Request<{}, {}, PostQueryParamInput>,
  res: Response<PostForBlogListPaginatedOutput>
) {
  try {
    const sanitizedQueryParam = matchedData<PostQueryParamInput>(req, {
      locations: ["query"],
      includeOptionals: true,
    });

    const queryParamInput =
      setDefaultSortAndPaginationIfNotExist(sanitizedQueryParam);

    const { items, totalCount } =
      await postsService.getAllPosts(queryParamInput);

    const fetchedPostsOutput = mapToPostListOutputUtil(items, {
      page: queryParamInput.pageNumber,
      pageSize: queryParamInput.pageSize,
      totalCount,
    });

    res.status(HTTP_STATUS_CODES.OK_200).json(fetchedPostsOutput);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
