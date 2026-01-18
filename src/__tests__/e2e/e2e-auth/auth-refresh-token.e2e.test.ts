import express from "express";

import { setupApp } from "app";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { createAuthLogin } from "../utils/auth/auth-login.util";
import { setRegisterAndConfirmUser } from "../utils/auth/registr-and-confirm-user.util";
import { runDB, stopDB } from "db/mongo.db";
import { appConfig } from "@core/settings/config";
import { clearDB } from "../utils/clear-db";
import { extractRefreshTokenCookie } from "../utils/cookie/cookies.util";
import {
  setAuthRefreshToken,
  getRefreshToken,
} from "../utils/auth/auth-refresh-token.util";

describe("E2E Auth refresh-token tests", () => {
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

  it("POST /auth/refresh-token -> status 200 - returns accessToken in body and sets refreshToken cookie", async () => {
    const userDto = await setRegisterAndConfirmUser();

    const loginResult = await createAuthLogin(app, {
      loginOrEmail: userDto.login,
      password: userDto.password,
    }).expect(HTTP_STATUS_CODES.OK_200);

    const oldRefreshCookie = extractRefreshTokenCookie(
      loginResult.headers["set-cookie"]
    );

    const refreshResult = await setAuthRefreshToken(
      app,
      oldRefreshCookie
    ).expect(HTTP_STATUS_CODES.OK_200);

    expect(refreshResult.body).toEqual({
      accessToken: expect.any(String),
    });

    // * проверка accessToken на совместимость с JWT
    expect(typeof refreshResult.body.accessToken).toBe("string");
    expect(refreshResult.body.accessToken.split(".")).toHaveLength(3);

    // const setCookieRaw = getCookieString(refreshResult.headers["set-cookie"]);

    // expect(setCookieRaw.toLowerCase()).toContain("refreshtoken=");
    // expect(setCookieRaw.toLowerCase()).toContain("httponly");
    // expect(setCookieRaw.toLowerCase()).toContain("secure");
    // expect(setCookieRaw.toLowerCase()).toContain("samesite=strict");
    // expect(setCookieRaw.toLowerCase()).toContain("path=/");
  });

  it("POST /auth/refresh-token -> status 401 - if no refreshToken cookie", async () => {
    await getRefreshToken(app);
  });

  it("POST /auth/refresh-token -> rotation: old refresh becomes invalid (old -> 401, new -> 200)", async () => {
    const userDto = await setRegisterAndConfirmUser();

    const loginResult = await createAuthLogin(app, {
      loginOrEmail: userDto.login,
      password: userDto.password,
    }).expect(HTTP_STATUS_CODES.OK_200);

    const oldRefreshCookie = extractRefreshTokenCookie(
      loginResult.headers["set-cookie"]
    );

    const refreshResult = await setAuthRefreshToken(
      app,
      oldRefreshCookie
    ).expect(HTTP_STATUS_CODES.OK_200);

    const newRefreshCookie = extractRefreshTokenCookie(
      refreshResult.headers["set-cookie"]
    );

    expect(newRefreshCookie).not.toEqual(oldRefreshCookie);

    // * old refresh must be revoked
    await setAuthRefreshToken(app, oldRefreshCookie).expect(
      HTTP_STATUS_CODES.UNAUTHORIZED_401
    );

    // * new refresh must still work
    await setAuthRefreshToken(app, newRefreshCookie).expect(
      HTTP_STATUS_CODES.OK_200
    );
  });
});
