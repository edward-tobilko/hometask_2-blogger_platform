import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { setupApp } from "app";
import { clearDb } from "../utils/clear-db";
import { createAuthLogin } from "../utils/auth/auth-login.util";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { setRegisterAndConfirmUser } from "../utils/auth/registr-and-confirm-user.util";
import { getAuthMe } from "../utils/auth/auth-me.util";
import { runMongoose, stopMongoose } from "db/mongoose.db";

describe("E2E Auth Me tests", () => {
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

  it("POST: /auth/me -> status 200 - with valid access token", async () => {
    const userDto = await setRegisterAndConfirmUser(app);

    const loginResult = await createAuthLogin(app, {
      loginOrEmail: userDto.email,
      password: userDto.password,
    }).expect(HTTP_STATUS_CODES.OK_200);

    const meResult = await getAuthMe(app, loginResult.body.accessToken).expect(
      HTTP_STATUS_CODES.OK_200
    );

    expect(meResult.body).toHaveProperty("email", userDto.email);
    expect(meResult.body).toHaveProperty("login", userDto.login);
    expect(meResult.body).toHaveProperty("userId", expect.any(String));
  });

  it("GET: /auth/me -> status 401 without token (Unauthorized)", async () => {
    await getAuthMe(app).expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });

  it("GET: /auth/me -> status 401 - with invalid token", async () => {
    await getAuthMe(app, "invalidToken").expect(
      HTTP_STATUS_CODES.UNAUTHORIZED_401
    );
  });

  it("GET: /auth/me -> status 401 - with expired token", async () => {
    const expiredToken = jwt.sign(
      { userId: "someId" },
      process.env.AT_SECRET!,
      { expiresIn: "0s" }
    );

    await getAuthMe(app, expiredToken).expect(
      HTTP_STATUS_CODES.UNAUTHORIZED_401
    );
  });
});
