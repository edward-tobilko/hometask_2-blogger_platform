import request from "supertest";
import { Express } from "express";

import { routersPaths } from "@core/paths/paths";

const registrationPath = `${routersPaths.auth}/registration`;

export function authRegisterUser(app: Express, dto: any) {
  return request(app).post(registrationPath).send(dto);
}
