import request from "supertest";
import { Express } from "express";

import { routersPaths } from "@core/paths/paths";

const refreshPath = `${routersPaths.auth}/refresh-token`;

export function authRefreshToken(app: Express, cookie: string) {
  return request(app).post(refreshPath).set("Cookie", cookie);
}
