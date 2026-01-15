import request from "supertest";
import { Express } from "express";

import { routersPaths } from "@core/paths/paths";
import { LoginAuthDtoCommand } from "auth/application/commands/login-auth-dto.command";

const loginPath = `${routersPaths.auth}/login`;

export function createAuthLogin(app: Express, dto: any) {
  return request(app).post(loginPath).send(dto);
}

export function getLoginDto(): LoginAuthDtoCommand {
  return {
    loginOrEmail: "TekMr6PvRu",
    password: "qwerty123",
  };
}
