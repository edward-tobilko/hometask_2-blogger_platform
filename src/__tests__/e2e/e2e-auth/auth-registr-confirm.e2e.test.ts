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
import { createAuthConfirmRegistration } from "../utils/auth/auth-confirm-registr.util";

describe("E2E Auth Registration Confirmation tests", () => {
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

  it("POST: /auth/registration-confirmation -> status 204 (success)", async () => {
    const userDto = getUserDto();

    await createAuthRegisterUser(app, userDto).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    const userBefore = await userCollection.findOne({ email: userDto.email });

    expect(userBefore).toBeTruthy();
    expect(userBefore!.emailConfirmation.isConfirmed).toBe(false);

    await createAuthConfirmRegistration(app, {
      code: userBefore!.emailConfirmation.confirmationCode,
    }).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    const userAfter = await userCollection.findOne({ email: userDto.email });

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

    const user = await userCollection.findOne({ email: userDto.email });

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

    const userBefore = await userCollection.findOne({ email: userDto.email });

    // * make code expired
    await userCollection.updateOne(
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

  it("POST: /auth/registration-confirmation -> status 429 (rate limit)", async () => {
    // * важно: чтобы лимитер реально работал в e2e (так как мы его выключили в customRateLimiterMiddleware)
    const prev = process.env.DISABLE_RATE_LIMIT;
    process.env.DISABLE_RATE_LIMIT = "false";

    try {
      const userDto = getUserDto();

      await createAuthRegisterUser(app, userDto).expect(
        HTTP_STATUS_CODES.NO_CONTENT_204
      );

      const user = await userCollection.findOne({ email: userDto.email });

      expect(user).toBeTruthy();

      const payload = { code: user!.emailConfirmation.confirmationCode };

      // * 5 попыток в окно (max=5) -> 400 (потому что код неправильный), но лимитер считает запросы:  - первый раз - 204, "already applied" - 400 след. попытки.
      for (let i = 0; i < 5; i++) {
        await createAuthConfirmRegistration(app, payload).expect((res) => {
          // * принимаем 204 или 400, потому что после первого подтверждения будет «already applied»
          expect([
            HTTP_STATUS_CODES.NO_CONTENT_204,
            HTTP_STATUS_CODES.BAD_REQUEST_400,
          ]).toContain(res.status);
        });
      }

      // * 6-я попытка в то же окно -> 429
      await createAuthConfirmRegistration(app, payload).expect(
        HTTP_STATUS_CODES.TOO_MANY_REQUESTS_429
      );
    } finally {
      process.env.DISABLE_RATE_LIMIT = prev;
    }
  });
});
