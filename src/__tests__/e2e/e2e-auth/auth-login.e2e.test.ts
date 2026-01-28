import express from "express";

import { setupApp } from "app";
import { runDB, stopDB } from "db/mongo.db";
import { appConfig } from "@core/settings/config";
import { clearDB } from "../utils/clear-db";
import { createAuthLogin, getLoginDto } from "../utils/auth/auth-login.util";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { setRegisterAndConfirmUser } from "../utils/auth/registr-and-confirm-user.util";
import { extractRefreshTokenCookie } from "../utils/cookie/cookies.util";

const loginDto = getLoginDto();

describe("E2E Auth Login tests", () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);
  });

  beforeEach(async () => {
    await clearDB(app);
  });

  afterAll(async () => {
    await stopDB();
  });

  it("POST: /auth/login -> status 200 - returns accessToken and sets refreshToken cookie", async () => {
    const userDto = await setRegisterAndConfirmUser();

    const result = await createAuthLogin(app, {
      loginOrEmail: userDto.login,
      password: userDto.password,
    }).expect(HTTP_STATUS_CODES.OK_200);

    expect(result.body).toHaveProperty("accessToken");
    expect(typeof result.body.accessToken).toBe("string");

    const cookie = extractRefreshTokenCookie(result.headers["set-cookie"]);

    expect(cookie.startsWith("refreshToken=")).toBe(true);
  });

  it("POST: /auth/login -> check rate limit", async () => {
    const userDto = await setRegisterAndConfirmUser();

    const payload = {
      loginOrEmail: userDto.login,
      password: userDto.password,
    };

    // * Делаем 5 запросов подряд (лимит 5)
    for (let i = 0; i < 5; i++) {
      await createAuthLogin(app, payload).expect(HTTP_STATUS_CODES.OK_200);
    }

    // * 6-й запросс = 429
    await createAuthLogin(app, payload).expect(
      HTTP_STATUS_CODES.TOO_MANY_REQUESTS_429
    );
  });

  it("POST: /auth/login -> rate limit resets after time window", async () => {
    const userDto = await setRegisterAndConfirmUser();

    for (let i = 0; i < 6; i++) {
      await createAuthLogin(app, {
        loginOrEmail: userDto.login,
        password: userDto.password,
      });
    }

    // * Waiting for 11sec (windowMs = 10sec)
    await new Promise((resolve) => setTimeout(resolve, 11000));

    await createAuthLogin(app, {
      loginOrEmail: userDto.login,
      password: userDto.password,
    }).expect(HTTP_STATUS_CODES.OK_200);
  }, 20000);

  it("POST: /auth/login -> status 401 - with wrong password", async () => {
    const userDto = await setRegisterAndConfirmUser();

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
