import express from "express";

import { setupApp } from "app";
import { runDB, stopDB } from "db/mongo.db";
import { appConfig } from "@core/settings/config";
import { clearDB } from "__tests__/utils/clear-db";
import { authLogin } from "__tests__/utils/auth/auth-login.util";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { registerAndConfirmUser } from "__tests__/utils/auth/registr-and-confirm-user.util";
import { extractRefreshTokenCookie } from "__tests__/utils/cookie/cookies.util";

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

  it("POST /auth/login -> 200 returns accessToken and sets refreshToken cookie", async () => {
    const userDto = await registerAndConfirmUser();

    const result = await authLogin(app, {
      loginOrEmail: userDto.login,
      password: userDto.password,
    }).expect(HTTP_STATUS_CODES.OK_200);

    expect(result.body).toHaveProperty("accessToken");
    expect(typeof result.body.accessToken).toBe("string");

    const cookie = extractRefreshTokenCookie(result.headers["set-cookie"]);

    expect(cookie.startsWith("refreshToken=")).toBe(true);
  });
});
