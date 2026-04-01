import express from "express";
import request from "supertest";

import { setupApp } from "../../../app";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { routersPaths } from "../../../core/paths/paths";
import { createUserBodyDto } from "../utils/users/create-user.util";
import { getUsersList } from "../utils/users/get-users-list.util";
import { runMongoose, stopMongoose } from "db/mongoose.db";
import { clearDb } from "../utils/clear-db";
import { CreateUserRP } from "users/presentation/request-payload-types/create-user.request-payload-types";

describe("E2E get users list tests", () => {
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

  it("GET: /users -> status 200 - should return users list (12 users with pagination)", async () => {
    // * create 12 users
    for (let i = 1; i <= 12; i++) {
      await createUserBodyDto(app, {
        login: `user${i}`,
        password: "qwerty123",
        email: `user${i}@example.dev`,
      });
    }

    // * на 1й сторанице -> pageSize=10 (totalCount=12, pagesCount=2)
    const page1 = await getUsersList(app, {
      query: { pageNumber: 1, pageSize: 10 },
    }).expect(HTTP_STATUS_CODES.OK_200);

    expect(page1.body.totalCount).toBe(12);
    expect(page1.body.pagesCount).toBe(2);
    expect(page1.body.items).toHaveLength(10);

    // * проверяем структуру первого элемента
    expect(page1.body.items[0]).toEqual({
      id: expect.any(String),
      login: expect.any(String),
      email: expect.any(String),
      createdAt: expect.any(String),
    });

    // * на 2й сторанице -> pageSize=2 (totalCount=12, pagesCount=2)
    const page2 = await getUsersList(app, {
      query: { pageNumber: 2, pageSize: 10 },
    }).expect(HTTP_STATUS_CODES.OK_200);

    expect(page2.body.totalCount).toBe(12);
    expect(page2.body.pagesCount).toBe(2);
    expect(page2.body.items).toHaveLength(2);
  });

  // * searching user by login
  it("should search by login", async () => {
    await createUserBodyDto(app, {
      login: "john",
      password: "pass123",
      email: "john@test.com",
    });

    await createUserBodyDto(app, {
      login: "jane",
      password: "pass123",
      email: "jane@test.com",
    });

    const response = await getUsersList(app, {
      query: { searchLoginTerm: "john" },
    }).expect(HTTP_STATUS_CODES.OK_200);

    expect(response.body.totalCount).toBe(1);

    // * проверяем что нашли john
    expect(response.body.items[0].login).toBe("john");

    // * проверяем что jane не попала
    expect(
      response.body.items.find((item: CreateUserRP) => item.login === "jane")
    ).toBeUndefined();
  });

  // * searching user by email
  it("should search by email", async () => {
    await createUserBodyDto(app, {
      login: "john",
      password: "pass123",
      email: "john@test.com",
    });

    await createUserBodyDto(app, {
      login: "jane",
      password: "pass123",
      email: "jane@test.com",
    });

    const response = await getUsersList(app, {
      query: { searchEmailTerm: "jane@test.com" },
    }).expect(HTTP_STATUS_CODES.OK_200);

    expect(response.body.totalCount).toBe(1);
    expect(response.body.items[0].email).toBe("jane@test.com");
  });

  it("GET /users -> status 401 - if no Basic auth", async () => {
    await request(app)
      .get(`${routersPaths.users}`)
      .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });
});
