import request from "supertest";
import { Express } from "express";

import { routersPaths } from "@core/paths/paths";

export function getAuthMe(app: Express, accessToken: string) {
  return request(app)
    .get(`${routersPaths.auth}/me`)
    .set("Authorization", `Bearer ${accessToken}`);
}
