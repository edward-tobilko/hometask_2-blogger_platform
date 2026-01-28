import request from "supertest";
import { Express } from "express";

import { routersPaths } from "@core/paths/paths";
import { LoginAuthDtoCommand } from "auth/application/commands/login-auth-dto.command";

export const loginPath = `${routersPaths.auth}/login`;

export function getLoginDto(): LoginAuthDtoCommand {
  return {
    loginOrEmail: "TekMr6PvRu",
    password: "qwerty123",
  };
}

export function createAuthLogin(
  app: Express,
  dto: LoginAuthDtoCommand,
  userAgent: string = "Jest E2E Test"
) {
  return request(app)
    .post(loginPath)
    .set("User-Agent", userAgent) // for userDeviceTitle
    .send(dto);
}
