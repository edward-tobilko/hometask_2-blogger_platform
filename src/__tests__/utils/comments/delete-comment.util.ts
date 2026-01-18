import request from "supertest";
import { Express } from "express";

import { routersPaths } from "@core/paths/paths";

export function deleteCommentById(
  app: Express,
  commentId: string,
  accessToken: string
) {
  const commentPath = `${routersPaths.comments}/${commentId}`;

  return request(app)
    .delete(commentPath)
    .set("Authorization", `Bearer ${accessToken}`);
}
