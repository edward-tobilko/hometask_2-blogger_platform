import request from "supertest";
import { Express } from "express";

import { routersPaths } from "@core/paths/paths";

export function getCommentById(app: Express, commentId: string) {
  const commentPath = `${routersPaths.comments}/${commentId}`;

  return request(app).get(commentPath);
}
