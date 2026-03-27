import express from "express";
import request from "supertest";
import mongoose from "mongoose";

import { setupApp } from "app";
import { clearDb } from "../utils/clear-db";
import { routersPaths } from "@core/paths/paths";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { setRegisterAndConfirmUser } from "../utils/auth/registr-and-confirm-user.util";
import { container } from "@core/di/inversify.config";
import { IUsersQueryRepository } from "users/application/interfaces/users-query-repo.interface";
import { Types } from "@core/di/types";
import { IUsersRepository } from "users/application/interfaces/users-repo.interface";
import { createAuthLogin } from "../utils/auth/auth-login.util";
import { runMongoose, stopMongoose } from "db/mongoose.db";

const newPasswordUrl = `${routersPaths.auth}/new-password`;
const passwordRecoveryUrl = `${routersPaths.auth}/password-recovery`;

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

  it("POST: /auth/new-password -> 400 if recoveryCode expired (using IoC repo to force expiration)", async () => {
    // * register and confirm user
    const user = await setRegisterAndConfirmUser(app);

    // * send recovery password
    await request(app)
      .post(passwordRecoveryUrl)
      .send({ email: user.email })
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    // * get confirmation code from mongo by IoC
    const usersQueryRepo = container.get<IUsersQueryRepository>(
      Types.IUsersQueryRepository
    );
    const usersRepo = container.get<IUsersRepository>(Types.IUsersRepository);

    const dbUser = await usersQueryRepo.findByEmail(user.email);

    const recoveryCode = dbUser!.recoveryPasswordInfo?.recoveryCode;
    if (!recoveryCode) {
      throw new Error("Recovery code not found");
    }

    if (!dbUser || !dbUser._id) {
      throw new Error("User not found or _id missing");
    }

    expect(dbUser?._id).toBeTruthy();
    expect(dbUser!.recoveryPasswordInfo?.recoveryCode).toBeTruthy();

    // * делаем expirationDate в прошлом (просрочено)
    await usersRepo.sendRecoveryPasswordEmail(dbUser!._id, {
      recoveryCode,
      expirationDate: new Date(Date.now() - 60_000), // 1 минута назад
    });

    await request(app)
      .post(newPasswordUrl)
      .send({
        newPassword: "NewPass123!",
        recoveryCode: dbUser!.recoveryPasswordInfo?.recoveryCode,
      })
      .expect(HTTP_STATUS_CODES.BAD_REQUEST_400);
  });

  it("POST: /auth/new-password -> 204 if code is valid and new password is accepted", async () => {
    // * register and confirm user
    const user = await setRegisterAndConfirmUser(app);

    // * send recovery password
    await request(app)
      .post(passwordRecoveryUrl)
      .send({ email: user.email })
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    // * get confirmation code from mongo by IoC
    const usersQueryRepo = container.get<IUsersQueryRepository>(
      Types.IUsersQueryRepository
    );

    const dbUser = await usersQueryRepo.findByEmail(user.email);

    expect(dbUser).toBeTruthy();
    expect(dbUser!.recoveryPasswordInfo?.recoveryCode).toBeTruthy();

    // * confirm new password
    await request(app)
      .post(newPasswordUrl)
      .send({
        newPassword: "NewPass123!",
        recoveryCode: dbUser!.recoveryPasswordInfo?.recoveryCode,
      })
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    // * login user by new password -> 200
    await createAuthLogin(app, {
      loginOrEmail: user.login,
      password: "NewPass123!",
    }).expect(HTTP_STATUS_CODES.OK_200);

    // * check if login by old password -> 400
    await createAuthLogin(app, {
      loginOrEmail: user.login,
      password: user.password,
    }).expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });

  it("POST: /auth/new-password -> 400 if recoveryCode incorrect", async () => {
    await request(app)
      .post(newPasswordUrl)
      .send({
        newPassword: "NewPass123!",
        recoveryCode: "incorrect-recovery-code",
      })
      .expect(400);
  });

  it.each([
    {
      name: "newPassword is missing",
      payload: { recoveryCode: "some-code" }, // newPassword is missing
      field: "newPassword",
    },
    {
      name: "newPassword must be string",
      payload: { recoveryCode: "some-code", newPassword: 123 },
      field: "newPassword",
    },
    {
      name: "newPassword length > 20 symbols",
      payload: { recoveryCode: "some-code", newPassword: "a".repeat(21) },
      field: "newPassword",
    },
    {
      name: "newPassword length < 6 symbols",
      payload: { recoveryCode: "some-code", newPassword: "a".repeat(5) },
      field: "newPassword",
    },
  ] as const)(
    "POST: /auth/new-password -> 400 if invalid password",
    async ({ payload, field }) => {
      const result = await request(app)
        .post(newPasswordUrl)
        .send(payload)
        .expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

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
