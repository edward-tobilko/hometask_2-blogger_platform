import request from "supertest";
import { Express } from "express";

import { routersPaths } from "@core/paths/paths";

export function createComment(app: Express, content: string) {
  return request(app).post(`${routersPaths.comments}`);
}
