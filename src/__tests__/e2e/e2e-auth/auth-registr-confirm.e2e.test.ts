import express from "express";
import mongoose from "mongoose";

import { setupApp } from "app";
import { clearDb } from "../utils/clear-db";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { getUserDto } from "../utils/users/get-user-dto.util";
import { createAuthRegisterUser } from "../utils/auth/auth-registr.util";
import { createAuthConfirmRegistration } from "../utils/auth/auth-confirm-registr.util";
import { runMongoose, stopMongoose } from "db/mongoose.db";
import { UserModel } from "users/infrastructure/schemas/user-schema";
import { container } from "@core/di/inversify.config";
import { IUsersRepository } from "users/application/interfaces/users-repo.interface";
import { DiTypes } from "@core/di/types";
import { createAuthLogin } from "../utils/auth/auth-login.util";

describe("E2E Auth Registration Confirmation tests", () => {
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

  it("POST: /auth/registration-confirmation -> status 204 (success)", async () => {
    const userDto = getUserDto();

    await createAuthRegisterUser(app, userDto).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    const userBefore = await UserModel.findOne({ email: userDto.email });

    expect(userBefore).toBeTruthy();
    expect(userBefore!.emailConfirmation.isConfirmed).toBe(false);

    await createAuthConfirmRegistration(app, {
      code: userBefore!.emailConfirmation.confirmationCode,
    }).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    const userAfter = await UserModel.findOne({ email: userDto.email });

    expect(userAfter).toBeTruthy();
    expect(userAfter!.emailConfirmation.isConfirmed).toBe(true);
  });

  it.each([
    {
      name: "code is empty string",
      payload: { code: "" },
      field: "code",
    },
    {
      name: "code is missing",
      payload: {},
      field: "code",
    },
    {
      name: "code must be string",
      payload: { code: 123 },
      field: "code",
    },
  ] as const)(
    "POST: /auth/registration-confirmation -> status 400 (validation errors)",
    async ({ payload, field }) => {
      const result = await createAuthConfirmRegistration(app, payload).expect(
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

  it("POST: /auth/registration-confirmation -> status 400 (incorrect code)", async () => {
    const userDto = getUserDto();

    await createAuthRegisterUser(app, userDto).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    const result = await createAuthConfirmRegistration(app, {
      code: "WRONG_CODE",
    }).expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

    expect(result.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
          field: "code",
        }),
      ])
    );
  });

  it("POST: /auth/registration-confirmation -> status 400 (already applied)", async () => {
    const userDto = getUserDto();

    await createAuthRegisterUser(app, userDto).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    const user = await UserModel.findOne({ email: userDto.email });

    // * confirm once
    await createAuthConfirmRegistration(app, {
      code: user!.emailConfirmation.confirmationCode,
    }).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    // * confirm second time -> should be 400
    const result = await createAuthConfirmRegistration(app, {
      code: user!.emailConfirmation.confirmationCode,
    }).expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

    expect(result.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
          field: "code",
        }),
      ])
    );
  });

  it("POST: /auth/registration-confirmation -> status 400 (expired code)", async () => {
    const userDto = getUserDto();

    await createAuthRegisterUser(app, userDto).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    const userBefore = await UserModel.findOne({ email: userDto.email });

    // * make code expired
    const usersRepo = container.get<IUsersRepository>(DiTypes.IUsersRepository);

    const userEntity = await usersRepo.findByEmail(userDto.email);

    userEntity!.forceExpireConfirmationCode();

    await usersRepo.save(userEntity!);

    const result = await createAuthConfirmRegistration(app, {
      code: userBefore!.emailConfirmation.confirmationCode,
    }).expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

    expect(result.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
          field: "code",
        }),
      ])
    );
  });

  it("POST: /auth/registration-confirmation -> after confirmation user can login", async () => {
    const userDto = getUserDto();

    await createAuthRegisterUser(app, userDto).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    // * до подтверждения → 401
    await createAuthLogin(app, {
      loginOrEmail: userDto.login,
      password: userDto.password,
    }).expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const user = await UserModel.findOne({ email: userDto.email });

    await createAuthConfirmRegistration(app, {
      code: user!.emailConfirmation.confirmationCode,
    }).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    // * после подтверждения → 200
    await createAuthLogin(app, {
      loginOrEmail: userDto.login,
      password: userDto.password,
    }).expect(HTTP_STATUS_CODES.OK_200);
  });
});
