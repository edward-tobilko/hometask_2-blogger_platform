import express from "express";
import request from "supertest";

import { setupApp } from "app";
import { runDB, stopDB } from "db/mongo.db";
import { clearDB } from "__tests__/utils/clear-db";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { appConfig } from "@core/settings/config";
import { routersPaths } from "@core/paths/paths";

import { setRegisterAndConfirmUser } from "__tests__/utils/auth/registr-and-confirm-user.util";
import { createAuthLogin } from "__tests__/utils/auth/auth-login.util";
import { extractRefreshTokenCookie } from "__tests__/utils/cookie/cookies.util";
import { createBlogUtil } from "__tests__/utils/blogs/create-blog.util";
import { createPostUtil } from "__tests__/utils/posts/create-post.util";
import { getPostDtoUtil } from "__tests__/utils/posts/get-post-dto.util";
import { createComment } from "__tests__/utils/comments/create-comment.util";

describe("E2E comments tests", () => {
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

  it("GET /comments/:id -> status 200  and returns comment view model", async () => {
    // * setup user + login
    const user = await setRegisterAndConfirmUser();
    const loginRes = await createAuthLogin(app, {
      loginOrEmail: user.login,
      password: user.password,
    }).expect(HTTP_STATUS_CODES.OK_200);

    const refreshCookie = extractRefreshTokenCookie(
      loginRes.headers["set-cookie"]
    );

    // * setup blog + post
    const blog = await createBlogUtil(app);
    const postDto = getPostDtoUtil(blog.id);
    const post = await createPostUtil(app, postDto);

    // * setup comment
    const createdComment = await createComment(app, {
      postId: post.id,
      content: "hello comment",
      refreshCookie,
    });

    // act
    const res = await request(app)
      .get(`${routersPaths.comments}/${createdComment.id}`)
      .expect(HTTP_STATUS_CODES.OK_200);

    // assert shape
    expect(res.body).toEqual({
      id: createdComment.id,
      content: "hello comment",
      commentatorInfo: {
        userId: expect.any(String),
        userLogin: expect.any(String),
      },
      createdAt: expect.any(String),
    });

    // extra: ISO check (простий)
    expect(new Date(res.body.createdAt).toString()).not.toBe("Invalid Date");
  });

  it("GET /comments/:id -> 200 even without Authorization (public endpoint)", async () => {
    // створюємо comment як в попередньому тесті
    const user = await setRegisterAndConfirmUser();
    const loginRes = await createAuthLogin(app, {
      loginOrEmail: user.login,
      password: user.password,
    }).expect(HTTP_STATUS_CODES.OK_200);

    const refreshCookie = extractRefreshTokenCookie(
      loginRes.headers["set-cookie"]
    );

    const blog = await createBlogUtil(app);
    const post = await createPostUtil(app, getPostDtoUtil(blog.id));

    const createdComment = await createCommentUtil(app, {
      postId: post.id,
      content: "public check",
      refreshCookie,
    });

    // act: БЕЗ токена
    const res = await request(app)
      .get(`${routersPaths.comments}/${createdComment.id}`)
      .expect(HTTP_STATUS_CODES.OK_200);

    expect(res.body.id).toBe(createdComment.id);
  });

  it("GET /comments/:id -> 404 if comment does not exist (valid ObjectId)", async () => {
    const nonExistingId = "507f1f77bcf86cd799439011";

    await request(app)
      .get(`${routersPaths.comments}/${nonExistingId}`)
      .expect(HTTP_STATUS_CODES.NOT_FOUND_404);
  });

  it.each([
    "abc",
    "123",
    "",
    "507f1f77bcf86cd79943901", // 23
    "507f1f77bcf86cd7994390111", // 25
    "zz7f1f77bcf86cd799439011", // not hex
  ])("GET /comments/:id -> 400 for invalid id: %s", async (badId) => {
    await request(app)
      .get(`${routersPaths.comments}/${badId}`)
      .expect(HTTP_STATUS_CODES.BAD_REQUEST_400);
  });
});
