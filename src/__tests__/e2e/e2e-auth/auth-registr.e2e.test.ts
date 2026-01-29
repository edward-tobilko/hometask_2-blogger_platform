import express from "express";
import request from "supertest";

import { setupApp } from "app";
import {
  customRateLimitCollection,
  runDB,
  stopDB,
  userCollection,
} from "db/mongo.db";
import { appConfig } from "@core/settings/config";
import { clearDB } from "../utils/clear-db";
import { routersPaths } from "@core/paths/paths";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { getUserDto } from "../utils/users/get-user-dto.util";
import { createAuthRegisterUser } from "../utils/auth/auth-registr.util";
import { UserDtoDomain } from "users/domain/user-dto.domain";

const testUserDto: UserDtoDomain = getUserDto();

describe("E2E Auth Registration tests", () => {
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

  const registrationPath = `${routersPaths.auth}/registration`;

  it("POST: /auth/registration -> status 204 (success)", async () => {
    const userDto = getUserDto();

    await request(app)
      .post(registrationPath)
      .send(userDto)
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    // * Минимальная проверка, что пользователь реально создан в БД
    const createdUser = await userCollection.findOne({ email: userDto.email });
    expect(createdUser).toBeTruthy();
    expect(createdUser!.emailConfirmation.isConfirmed).toBe(false);
  });

  it("POST: /auth/registration -> 400 (duplicate login)", async () => {
    const userDtoFirst = getUserDto();
    const userDtoSecond = {
      ...getUserDto(),
      login: userDtoFirst.login, // дубликат
      email: "example2@example.dev",
    };

    await createAuthRegisterUser(app, userDtoFirst).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    const createdUserResult = await createAuthRegisterUser(
      app,
      userDtoSecond
    ).expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

    // * Swagger: errorsMessages: [{ message, field }]
    expect(createdUserResult.body).toHaveProperty("errorsMessages");

    const fields = createdUserResult.body.errorsMessages.map(
      (e: any) => e.field
    );
    expect(fields).toContain("login");
  });

  it("POST: /auth/registration -> status 400 (duplicate email)", async () => {
    const userDtoFirst = getUserDto();
    const userDtoSecond = {
      ...getUserDto(),
      login: "TekMr6PvUa",
      email: userDtoFirst.email, // дубликат
    };

    await createAuthRegisterUser(app, userDtoFirst).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    const createdUserResult = await createAuthRegisterUser(
      app,
      userDtoSecond
    ).expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

    // * Swagger: errorsMessages: [{ message, field }]
    expect(createdUserResult.body).toHaveProperty("errorsMessages");

    const fields = createdUserResult.body.errorsMessages.map(
      (e: any) => e.field
    );
    expect(fields).toContain("email");
  });

  it.each([
    // * login validation
    {
      name: "login must be string",
      payload: { ...testUserDto, login: 2 },
      field: "login",
    },
    {
      name: "login length > 10 symbols",
      payload: { ...testUserDto, login: "a".repeat(11) },
      field: "login",
    },
    {
      name: "login length < 3 symbols",
      payload: { ...testUserDto, login: "ab" },
      field: "login",
    },

    // * password validation
    {
      name: "password must be string",
      payload: { ...testUserDto, password: 2 },
      field: "password",
    },
    {
      name: "password length > 20 symbols",
      payload: { ...testUserDto, password: "a".repeat(21) },
      field: "password",
    },
    {
      name: "password length < 6 symbols",
      payload: { ...testUserDto, password: "a".repeat(5) },
      field: "password",
    },

    // * email validation
    {
      name: "email must be string",
      payload: { ...testUserDto, email: 2 },
      field: "email",
    },
    {
      name: "email is invalid (random string)",
      payload: { ...testUserDto, email: "not-a-url" },
      field: "email",
    },
  ] as const)(
    "status 400 - validation dto errors",
    async ({ payload, field }) => {
      const createUserResponse = await createAuthRegisterUser(
        app,
        payload
      ).expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

      expect(createUserResponse.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.any(String),
            field,
          }),
        ])
      );
    }
  );

  it("POST: /auth/registration -> status 429 (too many requests)", async () => {
    const userDto = getUserDto();

    // * Первые 5 запросов (лимит 5) — первый даст 204, далее будут 400 (потому что email/login уже существует), но главное: все эти запросы валидны и доходят до rateLimiter.
    for (let i = 0; i < 5; i++) {
      await createAuthRegisterUser(app, userDto).expect((res) => {
        expect([
          HTTP_STATUS_CODES.NO_CONTENT_204,
          HTTP_STATUS_CODES.BAD_REQUEST_400,
        ]).toContain(res.status);
      });
    }

    // * 6-й запросс -> 429
    await createAuthRegisterUser(app, userDto).expect(
      HTTP_STATUS_CODES.TOO_MANY_REQUESTS_429
    );
  });
});
