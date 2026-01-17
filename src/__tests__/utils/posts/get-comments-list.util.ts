import request from "supertest";
import { Express } from "express";

import { PostCommentsSortFieldRP } from "posts/routes/request-payload-types/post-sort-field.request-payload-types";
import { SortDirections } from "@core/types/sort-directions.enum";
import { CommentsListRP } from "posts/routes/request-payload-types/comments-list.request-payload.";
import { routersPaths } from "@core/paths/paths";

export async function getCommentsList(
  app: Express,
  optional: { query?: Partial<CommentsListRP> } = {},
  postId: string
) {
  const { query } = optional;

  const defaultQuery: CommentsListRP = {
    pageNumber: 1,
    pageSize: 10,
    sortBy: PostCommentsSortFieldRP.CreatedAt,
    sortDirection: SortDirections.DESC,

    ...query,
  };

  const commentListRes = await request(app)
    .get(`${routersPaths.posts}/${postId}/comments`)
    .query(defaultQuery);

  return commentListRes;
}
