import { Request, Response } from "express";
import { matchedData } from "express-validator";

import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { postQueryService } from "../../application/post-query-service";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-pagination.helper";
import { PostCommentsSortFieldRP } from "../request-payload-types/post-sort-field.request-payload-types";
import { GetPostCommentsListQueryHandler } from "../../application/query-handlers/get-post-comments-list.query-handler";

export const getPostCommentsHandler = async (
  req: Request<{ postId: string }>,
  res: Response
) => {
  try {
    const postId = req.params.postId;

    const sanitizedQueryParam = matchedData<GetPostCommentsListQueryHandler>(
      req,
      {
        locations: ["query"],
        includeOptionals: false, // в data будут только те поля, которые реально пришли в запросе и прошли валидацию
      }
    );

    const queryParamInput = {
      ...setDefaultSortAndPaginationIfNotExist<PostCommentsSortFieldRP>(
        sanitizedQueryParam
      ),

      postId,
    };

    const postCommentsListOutput =
      await postQueryService.getPostCommentsList(queryParamInput);

    res.status(HTTP_STATUS_CODES.OK_200).json(postCommentsListOutput);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
