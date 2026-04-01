import express from "express";
import mongoose from "mongoose";
import request from "supertest";

import { setupApp } from "app";
import { clearDb } from "../utils/clear-db";
import { createAuthLogin, getLoginDto } from "../utils/auth/auth-login.util";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { setRegisterAndConfirmUser } from "../utils/auth/registr-and-confirm-user.util";
import { SessionModel } from "auth/infrastructure/schemas/auth.schema";
import { runMongoose, stopMongoose } from "db/mongoose.db";
import { getUserDto } from "../utils/users/get-user-dto.util";
import { routersPaths } from "@core/paths/paths";

describe("E2E Auth Login tests", () => {
  const loginDto = getLoginDto();

  const app = express();

  beforeAll(async () => {
    await runMongoose();

    setupApp(app); // * IoC уже внутри setupApp (через initCompositionRoot)
  });

  beforeEach(async () => {
    await clearDb();
  });

  afterAll(async () => {
    await stopMongoose();

    // * страховка, если stopMongoose не зделает disconnect
    await mongoose.disconnect().catch(() => {});
  });

  it("POST: /auth/login -> status 200 - returns accessToken and sets refreshToken cookie", async () => {
    const userDto = await setRegisterAndConfirmUser(app);

    const result = await createAuthLogin(app, {
      loginOrEmail: userDto.login,
      password: userDto.password,
    }).expect(HTTP_STATUS_CODES.OK_200);

    expect(result.body).toHaveProperty("accessToken");
    expect(typeof result.body.accessToken).toBe("string");

    const rawCookies = result.headers["set-cookie"] as unknown as string[];
    const refreshCookie = rawCookies.find((c: string) =>
      c.startsWith("refreshToken=")
    );

    // * check important attributes
    expect(refreshCookie).toContain("HttpOnly");
    expect(refreshCookie).toContain("Path=/");

    const sessionsCount = await SessionModel.countDocuments({
      login: userDto.login,
    });
    expect(sessionsCount).toBe(1);
  });

  it("POST: /auth/login -> status 401 - if email not confirmed", async () => {
    const dto = getUserDto();

    // * создаём без подтверждения (isConfirmed = false)
    await request(app)
      .post(`${routersPaths.auth}/registration`)
      .send(dto)
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    // * пытаемся залогиниться без подтверждения email
    await createAuthLogin(app, {
      loginOrEmail: dto.login,
      password: dto.password,
    }).expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });

  it("POST: /auth/login -> status 401 - user does not exist", async () => {
    await createAuthLogin(app, {
      loginOrEmail: "nonexistent@test.com",
      password: "password123",
    }).expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });

  it("POST: /auth/login -> status 401 - with wrong password", async () => {
    const userDto = await setRegisterAndConfirmUser(app);

    await createAuthLogin(app, {
      loginOrEmail: userDto.login,
      password: "wrong_password",
    }).expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });

  it.each([
    // * loginOrEmail validation
    {
      name: "loginOrEmail must be a string",
      payload: { ...loginDto, loginOrEmail: 2 },
      field: "loginOrEmail",
    },
    {
      name: "loginOrEmail must not be empty",
      payload: { ...loginDto, loginOrEmail: "" },
      field: "loginOrEmail",
    },
    {
      name: "loginOrEmail length > 500 symbols",
      payload: { ...loginDto, loginOrEmail: "a".repeat(501) },
      field: "loginOrEmail",
    },
    {
      name: "loginOrEmail length < 3 symbols",
      payload: { ...loginDto, loginOrEmail: "ab" },
      field: "loginOrEmail",
    },

    // * password validation
    {
      name: "password must be a string",
      payload: { ...loginDto, password: 2 },
      field: "password",
    },
    {
      name: "password must not be empty",
      payload: { ...loginDto, password: "" },
      field: "password",
    },
    {
      name: "password length > 20 symbols",
      payload: { ...loginDto, password: "a".repeat(21) },
      field: "password",
    },
    {
      name: "password length < 6 symbols",
      payload: { ...loginDto, password: "abcde" },
      field: "password",
    },
  ] as const)(
    "POST: /auth/login -> status 400  (validation errors)",
    async ({ payload, field }) => {
      const result = await createAuthLogin(app, payload as any).expect(
        HTTP_STATUS_CODES.BAD_REQUEST_400
      );

      expect(result.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.any(String),
            field,
          }),
        ])
      );
    }
  );
});
