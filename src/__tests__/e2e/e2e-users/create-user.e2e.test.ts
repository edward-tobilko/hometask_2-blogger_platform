import express from "express";
import request from "supertest";

import { setupApp } from "app";
import { runDB, stopDB } from "db/mongo.db";
import { appConfig } from "@core/settings/config";
import { clearDB } from "__tests__/utils/clear-db";
import {
  createUser,
  createUserBodyDto,
  expectUserCreatedResponse,
} from "__tests__/utils/users/create-user.util";
import { getUserDto } from "__tests__/utils/users/get-user-dto.util";
import { routersPaths } from "@core/paths/paths";

describe("E2E create user tests", () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);
  });

  beforeEach(async () => {
    await clearDB(app);
  });

  afterAll(async () => {
    await stopDB();
  });

  it("POST /users -> status 201 - returns created user and this user appears in list", async () => {
    const dto = getUserDto();
    const createdUser = await createUserBodyDto(app, dto);

    expectUserCreatedResponse(createdUser, dto);
  });

  it.each([
    // * login
    {
      name: "login must be string",
      payload: { login: 123 },
      field: "login",
    },
    {
      name: "login is empty",
      payload: { login: "" },
      field: "login",
    },
    {
      name: "login too short",
      payload: { login: "ab" },
      field: "login",
    },
    {
      name: "login too long",
      payload: { login: "a".repeat(11) },
      field: "login",
    },

    // * password
    {
      name: "password must be string",
      payload: { password: 123 },
      field: "password",
    },
    {
      name: "password is empty",
      payload: { password: "" },
      field: "password",
    },
    {
      name: "password too short",
      payload: { password: "a".repeat(5) },
      field: "password",
    },
    {
      name: "password too long",
      payload: { password: "a".repeat(21) },
      field: "password",
    },

    // * email
    {
      name: "email must be string",
      payload: { email: 123 },
      field: "email",
    },
    {
      name: "email is empty",
      payload: { email: "" },
      field: "email",
    },
    {
      name: "email invalid format",
      payload: { email: "invalid-email" },
      field: "email",
    },
  ] as const)(
    "POST /users -> status 400 - validation errors",
    async ({ payload, field }) => {
      const dto = getUserDto(payload as any);

      const createdUser = await createUser(app, dto);

      expect(createdUser.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.any(String),
            field,
          }),
        ])
      );
    }
  );

  it("POST /users -> status 400 - if user already exists (login/email not unique)", async () => {
    const dto = getUserDto();

    await createUser(app, dto); // 201

    const duplicateResult = await createUser(app, dto);

    expect(duplicateResult.body.errorsMessages).toEqual(expect.any(Array));
    expect(duplicateResult.body.errorsMessages.length).toBeGreaterThan(0);
    expect(duplicateResult.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: expect.stringMatching(/login|email/i),
          message: expect.any(String),
        }),
      ])
    );
  });

  it("POST /users -> status 401 - if no Authorization", async () => {
    const dto = getUserDto();

    await request(app).post(`${routersPaths.users}`).send(dto); // 401
  });
});
