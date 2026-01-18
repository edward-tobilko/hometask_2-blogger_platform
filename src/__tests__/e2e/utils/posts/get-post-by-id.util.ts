import request from "supertest";
import { Express } from "express";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { PostOutput } from "../../../posts/application/output/post-type.output";
import { routersPaths } from "../../../core/paths/paths";

export async function getPostByIdBodyUtil(
  app: Express,
  postId: string
): Promise<PostOutput> {
  const fetchedPostById = await request(app)
    .get(`${routersPaths.posts}/${postId}`)
    .expect(HTTP_STATUS_CODES.OK_200);

  return fetchedPostById.body;
}

export async function getPostByIdResponseCodeUtil(
  app: Express,
  postId: string
): Promise<request.Response> {
  return await request(app).get(`${routersPaths.posts}/${postId}`);
}
