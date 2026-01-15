import request from "supertest";
import { Express } from "express";

import { routersPaths } from "@core/paths/paths";

const authRefreshPath = `${routersPaths.auth}/refresh-token`;

export function setAuthRefreshToken(app: Express, refreshToken: string) {
  return request(app).post(authRefreshPath).set("Cookie", refreshToken);
}

export function getRefreshToken(app: Express) {
  return request(app).post(authRefreshPath);
}
