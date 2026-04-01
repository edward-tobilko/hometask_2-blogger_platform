import express from "express";
import mongoose from "mongoose";

import { setupApp } from "app";
import { clearDb } from "../utils/clear-db";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { getUserDto } from "../utils/users/get-user-dto.util";
import { createAuthRegisterUser } from "../utils/auth/auth-registr.util";
import { createAuthResendRegistrationEmail } from "../utils/auth/auth-resend-email-confirm.util";
import { runMongoose, stopMongoose } from "db/mongoose.db";
import { UserModel } from "users/infrastructure/schemas/user-schema";
import { setRegisterAndConfirmUser } from "../utils/auth/registr-and-confirm-user.util";
import { createAuthConfirmRegistration } from "../utils/auth/auth-confirm-registr.util";

describe("E2E Auth Registration Email Resending tests", () => {
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

  it("POST: /auth/registration-email-resending -> status 204 (success, email exists and not confirmed)", async () => {
    const userDto = getUserDto();

    // * register user (creates user with isConfirmed=false)
    await createAuthRegisterUser(app, userDto).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    const userBefore = await UserModel.findOne({ email: userDto.email });

    expect(userBefore).toBeTruthy();
    expect(userBefore!.emailConfirmation.isConfirmed).toBe(false);

    // * getting old confirm code
    const oldCode = userBefore!.emailConfirmation.confirmationCode;

    // * resend confirmation email
    await createAuthResendRegistrationEmail(app, {
      email: userDto.email,
    }).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    // * confirmation code should be changed
    const userAfter = await UserModel.findOne({ email: userDto.email });

    expect(userAfter).toBeTruthy();
    expect(userAfter!.emailConfirmation.isConfirmed).toBe(false);

    const newCode = userAfter!.emailConfirmation.confirmationCode;

    // * check the code was changed
    expect(newCode).not.toBe(oldCode);
  });

  it("POST: /auth/registration-email-resending -> status 400 (validation: email is invalid)", async () => {
    const result = await createAuthResendRegistrationEmail(app, {
      email: "not-email",
    }).expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

    expect(result.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
          field: "email",
        }),
      ])
    );
  });

  it("POST: /auth/registration-email-resending -> status 400 (email already confirmed)", async () => {
    const userDto = getUserDto();

    // * register
    await createAuthRegisterUser(app, userDto).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    const userDto2 = await setRegisterAndConfirmUser(app);

    const result = await createAuthResendRegistrationEmail(app, {
      email: userDto2.email,
    }).expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

    expect(result.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
          field: "email",
        }),
      ])
    );
  });

  it("POST: /auth/registration-email-resending -> status 400 (email is missing)", async () => {
    const result = await createAuthResendRegistrationEmail(app, {}).expect(
      HTTP_STATUS_CODES.BAD_REQUEST_400
    );

    expect(result.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
          field: "email",
        }),
      ])
    );
  });

  it("POST: /auth/registration-email-resending -> status 400 (email not found)", async () => {
    const result = await createAuthResendRegistrationEmail(app, {
      email: "noone@example.dev",
    }).expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

    expect(result.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
          field: "email",
        }),
      ])
    );
  });

  it("POST: /auth/registration-email-resending -> new code confirms email successfully", async () => {
    const userDto = getUserDto();

    await createAuthRegisterUser(app, userDto).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    await createAuthResendRegistrationEmail(app, {
      email: userDto.email,
    }).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    // * получаем новый код
    const userAfter = await UserModel.findOne({ email: userDto.email });
    const newCode = userAfter!.emailConfirmation.confirmationCode;

    // * новый код должен заработать
    await createAuthConfirmRegistration(app, { code: newCode }).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    // * isConfirmed = true
    const userConfirmed = await UserModel.findOne({ email: userDto.email });
    expect(userConfirmed!.emailConfirmation.isConfirmed).toBe(true);
  });

  it("POST: /auth/registration-email-resending -> old code is invalid after resend", async () => {
    const userDto = getUserDto();

    await createAuthRegisterUser(app, userDto).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    const userBefore = await UserModel.findOne({ email: userDto.email });
    const oldCode = userBefore!.emailConfirmation.confirmationCode;

    await createAuthResendRegistrationEmail(app, {
      email: userDto.email,
    }).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    // * старый код не должен работать
    await createAuthConfirmRegistration(app, { code: oldCode }).expect(
      HTTP_STATUS_CODES.BAD_REQUEST_400
    );
  });
});
