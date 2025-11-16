import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { log } from "node:console";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { blogsService } from "../../application/blogs-service";
import { BlogQueryParamInput } from "../../types/blog.types";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-pagination.helper";
import { mapToPostForBlogListOutputUtil } from "../mappers/map-to-post-for-blog-list-output.uti";

export async function getPostListForBlogHandler(
  req: Request<{ id: string }, {}, BlogQueryParamInput>,
  res: Response
) {
  try {
    const sanitizedQueryParam = matchedData<BlogQueryParamInput>(req, {
      locations: ["query"],
      includeOptionals: true,
    });

    const queryParamInput: BlogQueryParamInput = {
      ...setDefaultSortAndPaginationIfNotExist(sanitizedQueryParam),
      blogId: req.params.id,
    };

    const { postsForBlog, totalCount } =
      await blogsService.getAllPostsForBlog(queryParamInput);

    log(
      `Post list for blog: ${postsForBlog.map((item) => item.blogName)} - Total: ${totalCount.toString()}`
    );

    const postListForBlogOutput = mapToPostForBlogListOutputUtil(postsForBlog, {
      page: queryParamInput.pageNumber,
      pageSize: queryParamInput.pageSize,
      totalCount,
    });

    res.status(HTTP_STATUS_CODES.OK_200).json(postListForBlogOutput);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
