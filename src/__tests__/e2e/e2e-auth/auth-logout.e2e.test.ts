import express from "express";

import { setupApp } from "app";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { authLogin } from "__tests__/utils/auth/auth-login.util";
import { registerAndConfirmUser } from "__tests__/utils/auth/registr-and-confirm-user.util";
import { runDB, stopDB } from "db/mongo.db";
import { appConfig } from "@core/settings/config";
import { clearDB } from "__tests__/utils/clear-db";
import { extractRefreshTokenCookie } from "__tests__/utils/cookie/cookies.util";
import { authLogout } from "__tests__/utils/auth/auth-logout.util";
import { authRefreshToken } from "__tests__/utils/auth/auth-refresh-token.util";

describe("E2E Auth logout tests", () => {
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

  it("POST /auth/logout -> status 204 and refresh-token becomes invalid (refresh after logout -> 401)", async () => {
    const userDto = await registerAndConfirmUser();

    const loginResult = await authLogin(app, {
      loginOrEmail: userDto.login,
      password: userDto.password,
    }).expect(HTTP_STATUS_CODES.OK_200);

    const refreshCookie = extractRefreshTokenCookie(
      loginResult.headers["set-cookie"]
    );

    const refreshResult = await authRefreshToken(app, refreshCookie).expect(
      HTTP_STATUS_CODES.OK_200
    );

    const newRefreshCookie = extractRefreshTokenCookie(
      refreshResult.headers["set-cookie"]
    );

    await authLogout(app, newRefreshCookie).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    // * после logout refresh-token больше не действителен
    await authRefreshToken(app, newRefreshCookie).expect(
      HTTP_STATUS_CODES.UNAUTHORIZED_401
    );
  });
});
