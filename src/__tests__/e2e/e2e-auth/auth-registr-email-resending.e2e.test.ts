import express from "express";

import { setupApp } from "app";
import {
  customRateLimitCollection,
  runDB,
  stopDB,
  userCollection,
} from "db/mongo.db";
import { appConfig } from "@core/settings/config";
import { clearDB } from "../utils/clear-db";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

import { getUserDto } from "../utils/users/get-user-dto.util";
import { createAuthRegisterUser } from "../utils/auth/auth-registr.util";
import { createAuthResendRegistrationEmail } from "../utils/auth/auth-resend-email-confirm.util";

describe("E2E Auth Registration Email Resending tests", () => {
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

  it("POST: /auth/registration-email-resending -> status 204 (success, email exists and not confirmed)", async () => {
    const userDto = getUserDto();

    // * register user (creates user with isConfirmed=false)
    await createAuthRegisterUser(app, userDto).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    const userBefore = await userCollection.findOne({ email: userDto.email });

    expect(userBefore).toBeTruthy();
    expect(userBefore!.emailConfirmation.isConfirmed).toBe(false);

    // * getting old confirm code
    const oldCode = userBefore!.emailConfirmation.confirmationCode;

    // * resend confirmation email
    await createAuthResendRegistrationEmail(app, {
      email: userDto.email,
    }).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    // * confirmation code should be changed
    const userAfter = await userCollection.findOne({ email: userDto.email });

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

    // * manually mark as confirmed (бысто и стабильней для e2e)
    await userCollection.updateOne(
      { email: userDto.email },
      { $set: { "emailConfirmation.isConfirmed": true } }
    );

    const result = await createAuthResendRegistrationEmail(app, {
      email: userDto.email,
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

  // OPTIONAL: only if your implementation returns 400 for non-existing email
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

  it("POST: /auth/registration-email-resending -> status 429 (too many requests)", async () => {
    const userDto = getUserDto();

    await createAuthRegisterUser(app, userDto).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    for (let i = 0; i < 5; i++) {
      await createAuthResendRegistrationEmail(app, {
        email: userDto.email,
      }).expect(HTTP_STATUS_CODES.NO_CONTENT_204);
    }

    // * 6-й запросс -> 429
    await createAuthResendRegistrationEmail(app, {
      email: userDto.email,
    }).expect(HTTP_STATUS_CODES.TOO_MANY_REQUESTS_429);
  });
});
