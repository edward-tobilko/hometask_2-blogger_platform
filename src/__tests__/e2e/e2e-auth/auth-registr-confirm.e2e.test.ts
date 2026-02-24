import express from "express";
import mongoose from "mongoose";

import { setupApp } from "app";
import { clearDb } from "../utils/clear-db";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

import { getUserDto } from "../utils/users/get-user-dto.util";
import { createAuthRegisterUser } from "../utils/auth/auth-registr.util";
import { createAuthConfirmRegistration } from "../utils/auth/auth-confirm-registr.util";
import { runMongoose, stopMongoose } from "db/mongoose.db";
import { UserModel } from "users/mongoose/user-schema.mongoose";

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
    await UserModel.updateOne(
      { email: userDto.email },
      {
        $set: {
          "emailConfirmation.expirationDate": new Date(Date.now() - 60_000),
        },
      } // 1 min ago
    );

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
});
