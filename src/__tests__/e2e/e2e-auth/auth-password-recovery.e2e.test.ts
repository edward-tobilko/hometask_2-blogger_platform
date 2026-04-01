import express from "express";
import request from "supertest";
import mongoose from "mongoose";

import { setupApp } from "app";
import { clearDb } from "../utils/clear-db";
import { routersPaths } from "@core/paths/paths";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { runMongoose, stopMongoose } from "db/mongoose.db";
import { setRegisterAndConfirmUser } from "../utils/auth/registr-and-confirm-user.util";
import { container } from "@core/di/inversify.config";
import { IUsersQueryRepository } from "users/application/interfaces/users-query-repo.interface";
import { DiTypes } from "@core/di/types";

const path = `${routersPaths.auth}/password-recovery`;

describe("E2E: password recovery flow", () => {
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

  it("POST: /auth/password-recovery -> 204: sends recovery email for existing user", async () => {
    const user = await setRegisterAndConfirmUser(app);

    await request(app)
      .post(path)
      .send({ email: user.email })
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    // * проверяем что recoveryCode появился в БД
    const usersQueryRepo = container.get<IUsersQueryRepository>(
      DiTypes.IUsersQueryRepository
    );
    const dbUser = await usersQueryRepo.findByEmail(user.email);

    expect(dbUser?.recoveryPasswordInfo?.recoveryCode).toBeDefined();
    expect(dbUser?.recoveryPasswordInfo?.expirationDate).toBeDefined();
    expect(
      new Date(dbUser!.recoveryPasswordInfo!.expirationDate) > new Date()
    ).toBe(true);
  });

  it("POST: /auth/password-recovery -> 204: even if current email is not registered (for prevent user's email detection)", async () => {
    await request(app)
      .post(path)
      .send({ email: "not-exist@gmail.com" })
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);
  });

  it("POST: /auth/password-recovery -> 400: if the inputModel has invalid email", async () => {
    const result = await request(app)
      .post(path)
      .send({ email: "222^gmail.com" })
      .expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

    expect(result.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "email",
          message: expect.any(String),
        }),
      ])
    );
  });

  it.each([
    { name: "invalid format", email: "222^gmail.com" },
    { name: "missing @", email: "invalidemail.com" },
    { name: "empty string", email: "" },
    { name: "missing domain", email: "test@" },
  ])("POST: /auth/password-recovery -> 400: $name", async ({ email }) => {
    const result = await request(app)
      .post(path)
      .send({ email })
      .expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

    expect(result.body.errorsMessages).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "email" })])
    );
  });
});
