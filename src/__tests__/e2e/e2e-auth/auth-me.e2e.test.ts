import express from "express";

import { setupApp } from "app";
import { customRateLimitCollection, runDB, stopDB } from "db/mongo.db";
import { appConfig } from "@core/settings/config";
import { clearDB } from "../utils/clear-db";
import { createAuthLogin } from "../utils/auth/auth-login.util";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { setRegisterAndConfirmUser } from "../utils/auth/registr-and-confirm-user.util";
import { getAuthMe } from "../utils/auth/auth-me.util";

describe("E2E Auth Me tests", () => {
  let app = express();

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);

    app = express();
    setupApp(app);
  });

  beforeEach(async () => {
    await clearDB(app);

    await customRateLimitCollection.deleteMany({});
  });

  afterAll(async () => {
    await stopDB();
  });

  it("POST: /auth/me -> status 200 - with valid access token", async () => {
    const userDto = await setRegisterAndConfirmUser();

    const loginResult = await createAuthLogin(app, {
      loginOrEmail: userDto.email,
      password: userDto.password,
    }).expect(HTTP_STATUS_CODES.OK_200);

    const meResult = await getAuthMe(app, loginResult.body.accessToken);

    expect(meResult.body).toHaveProperty("email", userDto.email);
    expect(meResult.body).toHaveProperty("login", userDto.login);
    expect(meResult.body).toHaveProperty("userId");
  });

  it("GET: /auth/me -> status 401 without token (Unauthorized)", async () => {
    await getAuthMe(app, "invalidToken").expect(
      HTTP_STATUS_CODES.UNAUTHORIZED_401
    );
  });
});
