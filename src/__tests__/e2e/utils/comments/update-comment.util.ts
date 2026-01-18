import { Express } from "express";
import request from "supertest";

import { routersPaths } from "@core/paths/paths";

export function updateComment(
  app: Express,
  commentId: string,
  accessToken: string,
  content?: string
) {
  const updateCommentPath = `${routersPaths.comments}/${commentId}`;

  const updatedContent = {
    content:
      content ||
      "Updated comment content with enough characters to pass validation",
  };

  return request(app)
    .put(updateCommentPath)
    .set("Authorization", `Bearer ${accessToken}`)
    .send(updatedContent);
}
