import request from "supertest";
import { Express } from "express";

import { routersPaths } from "@core/paths/paths";

const registrationConfirmPath = `${routersPaths.auth}/registration-confirmation`;

export function createAuthConfirmRegistration(app: Express, dto: any) {
  return request(app).post(registrationConfirmPath).send(dto);
}
