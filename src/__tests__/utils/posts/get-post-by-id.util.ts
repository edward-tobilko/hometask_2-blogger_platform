import request from "supertest";
import { Express } from "express";

import { PostViewModel } from "../../../posts/types/post.types";
import { POSTS_PATH } from "../../../core/paths/paths";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { generateBasicAuthToken } from "../generate-admin-auth-token";

export async function getPostByIdBodyUtil(
  app: Express,
  postId: string
): Promise<PostViewModel> {
  const fetchedPostById = await request(app)
    .get(`${POSTS_PATH}/${postId}`)
    .set("Authorization", generateBasicAuthToken())
    .expect(HTTP_STATUS_CODES.OK_200);

  return fetchedPostById.body;
}

export async function getPostByIdResponseCodeUtil(
  app: Express,
  postId: string
): Promise<request.Response> {
  return await request(app)
    .get(`${POSTS_PATH}/${postId}`)
    .set("Authorization", generateBasicAuthToken());
}
