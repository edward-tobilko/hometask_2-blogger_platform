import express from "express";
import mongoose from "mongoose";
import request from "supertest";

import { setupApp } from "app";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { createAuthLogin } from "../utils/auth/auth-login.util";
import { setRegisterAndConfirmUser } from "../utils/auth/registr-and-confirm-user.util";
import { extractRefreshTokenCookie } from "../utils/cookie/cookies.util";
import { setAuthLogout } from "../utils/auth/auth-logout.util";
import { setAuthRefreshToken } from "../utils/auth/auth-refresh-token.util";
import { runMongoose, stopMongoose } from "db/mongoose.db";
import { clearDb } from "../utils/clear-db";
import { routersPaths } from "@core/paths/paths";
import { SessionModel } from "@auth/infrastructure/schemas/auth.schema";

describe("E2E Auth logout tests", () => {
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

  it("POST: /auth/logout -> status 204 and refresh-token becomes invalid (refresh after logout -> 401)", async () => {
    const userDto = await setRegisterAndConfirmUser(app);

    const loginResult = await createAuthLogin(app, {
      loginOrEmail: userDto.login,
      password: userDto.password,
    }).expect(HTTP_STATUS_CODES.OK_200);

    const refreshCookie = extractRefreshTokenCookie(
      loginResult.headers["set-cookie"]
    );

    const refreshResult = await setAuthRefreshToken(app, refreshCookie).expect(
      HTTP_STATUS_CODES.OK_200
    );

    const newRefreshCookie = extractRefreshTokenCookie(
      refreshResult.headers["set-cookie"]
    );

    await setAuthLogout(app, newRefreshCookie).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    // * после logout refresh-token больше не действителен
    await setAuthRefreshToken(app, newRefreshCookie).expect(
      HTTP_STATUS_CODES.UNAUTHORIZED_401
    );

    // * проверяем, что сессия удалилась из БД
    const sessionsCount = await SessionModel.countDocuments({
      login: userDto.login,
    });

    expect(sessionsCount).toBe(0);
  });

  it("POST: /auth/logout -> status 401 - without refreshToken", async () => {
    await request(app)
      .post(`${routersPaths.auth}/logout`)
      .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });

  it("POST: /auth/logout -> status 401 - cannot logout twice with same token", async () => {
    const userDto = await setRegisterAndConfirmUser(app);
    const loginResult = await createAuthLogin(app, {
      loginOrEmail: userDto.login,
      password: userDto.password,
    });

    const refreshCookie = extractRefreshTokenCookie(
      loginResult.headers["set-cookie"]
    );

    await setAuthLogout(app, refreshCookie).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    // * повторный logout с тем же токеном → 401
    await setAuthLogout(app, refreshCookie).expect(
      HTTP_STATUS_CODES.UNAUTHORIZED_401
    );
  });

  it("POST: /auth/logout -> status 401 - old refreshToken invalid after rotation", async () => {
    const userDto = await setRegisterAndConfirmUser(app);
    const loginResult = await createAuthLogin(app, {
      loginOrEmail: userDto.login,
      password: userDto.password,
    });

    const oldRefreshCookie = extractRefreshTokenCookie(
      loginResult.headers["set-cookie"]
    );

    // * ротируем токен
    await setAuthRefreshToken(app, oldRefreshCookie).expect(
      HTTP_STATUS_CODES.OK_200
    );

    // * пытаемся выйти со старым токеном → 401
    await setAuthLogout(app, oldRefreshCookie).expect(
      HTTP_STATUS_CODES.UNAUTHORIZED_401
    );
  });
});
