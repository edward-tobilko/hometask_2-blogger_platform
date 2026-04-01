import express from "express";
import request from "supertest";

import { setupApp } from "app";
import {
  createUser,
  createUserBodyDto,
  expectUserCreatedResponse,
} from "../utils/users/create-user.util";
import { getUserDto } from "../utils/users/get-user-dto.util";
import { routersPaths } from "@core/paths/paths";
import { runMongoose, stopMongoose } from "db/mongoose.db";
import { clearDb } from "../utils/clear-db";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { getUsersList } from "../utils/users/get-users-list.util";

describe("E2E create user tests", () => {
  const app = express();

  beforeAll(async () => {
    await runMongoose();

    setupApp(app);
  });

  beforeEach(async () => {
    await clearDb();
  });

  afterAll(async () => {
    await stopMongoose();
  });

  it("POST /users -> status 201 - returns created user and this user appears in list", async () => {
    const dto = getUserDto();
    const createdUser = await createUserBodyDto(app, dto);

    expectUserCreatedResponse(createdUser, dto);

    // * List check
    const usersList = await getUsersList(app);

    expect(usersList.body.items).toHaveLength(1);
    expect(usersList.body.items[0].id).toBe(createdUser.id);
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

    const duplicateResult = await createUser(app, dto).expect(
      HTTP_STATUS_CODES.BAD_REQUEST_400
    );

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

    await request(app)
      .post(`${routersPaths.users}`)
      .send(dto)
      .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });
});
