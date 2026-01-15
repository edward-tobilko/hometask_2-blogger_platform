import express from "express";

import { setupApp } from "app";
import { runDB, stopDB } from "db/mongo.db";
import { appConfig } from "@core/settings/config";
import { clearDB } from "__tests__/utils/clear-db";
import { authLogin } from "__tests__/utils/auth/auth-login.util";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { registerAndConfirmUser } from "__tests__/utils/auth/registr-and-confirm-user.util";
import { authMe } from "__tests__/utils/auth/auth-me.util";

describe("E2E Auth Me tests", () => {
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

  it("POST /auth/me -> status 200 - with valid access token", async () => {
    const userDto = await registerAndConfirmUser();

    const loginResult = await authLogin(app, {
      loginOrEmail: userDto.email,
      password: userDto.password,
    }).expect(HTTP_STATUS_CODES.OK_200);

    const meResult = await authMe(app, loginResult.body.accessToken);

    expect(meResult.body).toHaveProperty("email", userDto.email);
    expect(meResult.body).toHaveProperty("login", userDto.login);
    expect(meResult.body).toHaveProperty("userId");
  });

  it("GET /auth/me -> status 401 without token (Unauthorized)", async () => {
    await authMe(app, "invalidToken").expect(
      HTTP_STATUS_CODES.UNAUTHORIZED_401
    );
  });
});
