import request from "supertest";
import { Express } from "express";

import { routersPaths } from "@core/paths/paths";

const resendEmailConfirmPath = `${routersPaths.auth}/registration-email-resending`;

export function createAuthResendRegistrationEmail(app: Express, dto: any) {
  return request(app).post(resendEmailConfirmPath).send(dto);
}
