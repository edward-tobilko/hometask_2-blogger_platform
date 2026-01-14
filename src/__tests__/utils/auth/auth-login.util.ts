import request from "supertest";
import { Express } from "express";

import { routersPaths } from "@core/paths/paths";

const loginPath = `${routersPaths.auth}/login`;

export function authLogin(app: Express, dto: any) {
  return request(app).post(loginPath).send(dto);
}
