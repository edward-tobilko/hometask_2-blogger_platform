import request from "supertest";
import { Express } from "express";

import { IPostCommentOutput } from "posts/application/output/post-comment.output";
import { routersPaths } from "@core/paths/paths";
import { getCommentForPostDto } from "./get-comment-for-post-dto.util";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

export async function createCommentForPost(
  app: Express,
  postId: string,
  accessToken: string
): Promise<IPostCommentOutput> {
  const routerPath = `${routersPaths.posts}/${postId}/comments`;
  const commentDto = getCommentForPostDto();

  const result = await request(app)
    .post(routerPath)
    .set("Authorization", `Bearer ${accessToken}`)
    .send(commentDto)
    .expect(HTTP_STATUS_CODES.CREATED_201);

  return result.body;
}
