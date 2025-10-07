import request from "supertest";
import { Express } from "express";

import { PostView } from "../../../posts/types/post.types";
import { POSTS_PATH } from "../../../core/paths/paths";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";

export async function getPostByIdBodyUtil(
  app: Express,
  postId: string
): Promise<PostView> {
  const fetchedPostById = await request(app)
    .get(`${POSTS_PATH}/${postId}`)
    .expect(HTTP_STATUS_CODES.OK_200);

  return fetchedPostById.body;
}

export async function getPostByIdResponseCodeUtil(
  app: Express,
  postId: string
): Promise<request.Response> {
  return await request(app).get(`${POSTS_PATH}/${postId}`);
}
