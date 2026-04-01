import express from "express";
import request from "supertest";
import mongoose from "mongoose";

import { setupApp } from "app";
import { routersPaths } from "@core/paths/paths";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { getUserDto } from "../utils/users/get-user-dto.util";
import { createAuthRegisterUser } from "../utils/auth/auth-registr.util";
import { UserDtoDomain } from "users/domain/value-objects/user-dto.domain";
import { runMongoose, stopMongoose } from "db/mongoose.db";
import { clearDb } from "../utils/clear-db";
import { UserModel } from "users/infrastructure/schemas/user-schema";

describe("E2E Auth Registration tests", () => {
  const testUserDto: UserDtoDomain = getUserDto();

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

  const registrationPath = `${routersPaths.auth}/registration`;

  it("POST: /auth/registration -> status 204 (success)", async () => {
    const userDto = getUserDto();

    await request(app)
      .post(registrationPath)
      .send(userDto)
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    // * Минимальная проверка, что пользователь реально создан в БД
    const createdUser = await UserModel.findOne({ email: userDto.email });

    expect(createdUser).toBeTruthy();
    expect(createdUser!.emailConfirmation.isConfirmed).toBe(false);
    expect(createdUser!.emailConfirmation.confirmationCode).toBeTruthy();
    expect(createdUser!.emailConfirmation.expirationDate).toBeTruthy();
  });

  it("POST: /auth/registration -> 400 (duplicate login)", async () => {
    const userDtoFirst = getUserDto();
    const userDtoSecond = {
      ...getUserDto(),
      login: userDtoFirst.login,
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
      name: "login is empty",
      payload: { ...testUserDto, login: "" },
      field: "login",
    },
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
      name: "password is empty",
      payload: { ...testUserDto, password: "" },
      field: "password",
    },
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
      name: "email is empty",
      payload: { ...testUserDto, email: "" },
      field: "email",
    },
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
});
