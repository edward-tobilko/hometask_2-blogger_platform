import express from "express";
import request from "supertest";

import { setupApp } from "../../../app";
import { clearDB } from "../../utils/clear-db";
import { runDB, stopDB } from "../../../db/mongo.db";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { routersPaths } from "../../../core/paths/paths";
import { appConfig } from "@core/settings/config";
import { createUserBodyDto } from "__tests__/utils/users/create-user.util";
import { createCommentForPost } from "__tests__/utils/posts/create-comment-for-post.util";
import { getCommentsList } from "__tests__/utils/posts/get-comments-list.util";

describe("E2E get users list tests", () => {
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

  it("GET: /posts/${postId}/comments -> status 200 - should return comments list (12 comment with pagination)", async () => {
    // * create 12 comments
    for (let i = 1; i <= 12; i++) {
      await createCommentForPost(app, {
        login: `user${i}`,
        password: "qwerty123",
        email: `user${i}@example.dev`,
      });
    }

    // * на 1й сторанице -> pageSize=10 (totalCount=12, pagesCount=2)
    const page1 = await getCommentsList(app, {
      query: { pageNumber: 1, pageSize: 10 },
    }).expect(HTTP_STATUS_CODES.OK_200);

    expect(page1.body.totalCount).toBe(12);
    expect(page1.body.pagesCount).toBe(2);
    expect(page1.body.items).toHaveLength(10);

    // * на 2й сторанице -> pageSize=2 (totalCount=12, pagesCount=2)
    const page2 = await getCommentsList(app, {
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

    const response = await getCommentsList(app, {
      query: { searchLoginTerm: "john" },
    }).expect(HTTP_STATUS_CODES.OK_200);

    expect(response.body.totalCount).toBe(1);
    expect(response.body.items[0].login).toBe("john");
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

    const response = await getCommentsList(app, {
      query: { searchEmailTerm: "jane@test.com" },
    }).expect(HTTP_STATUS_CODES.OK_200);

    expect(response.body.totalCount).toBe(1);
    expect(response.body.items[0].email).toBe("jane@test.com");
  });

  it("GET /users -> status 401 - if no Basic auth", async () => {
    await request(app)
      .post(`${routersPaths.users}`)
      .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });
});
