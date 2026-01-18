import express from "express";
import request from "supertest";

import { setupApp } from "app";
import { runDB, stopDB } from "db/mongo.db";
import { clearDB } from "../utils/clear-db";
import { appConfig } from "@core/settings/config";
import { setupUserLoginBlogPost } from "../utils/posts/setup-user-login-blog-post.util";
import { createCommentForPost } from "../utils/posts/create-comment-for-post.util";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { routersPaths } from "@core/paths/paths";
import { getCommentForPostDto } from "../utils/posts/get-comment-for-post-dto.util";

describe("E2E create comment for post tests", () => {
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

  // * return status 201
  it("should create comment for post and return 201 with created comment", async () => {
    const { userRes, postRes, accessToken } = await setupUserLoginBlogPost(app);

    // * Создаем comment for post
    const commentRes = await createCommentForPost(app, postRes.id, accessToken);

    // * Проверяем структуру ответа
    expect(commentRes).toEqual({
      id: expect.any(String),
      content: commentRes.content,

      commentatorInfo: {
        userId: userRes.id,
        userLogin: userRes.login,
      },

      createdAt: expect.any(String),
    });
  });

  // * return status 400
  it.each([
    {
      name: "content is missing",
      payload: {},
      field: "content",
    },
    {
      name: "content is too short",
      payload: { content: "abc" },
      field: "content",
    },
    {
      name: "content is too long",
      payload: { content: "a".repeat(301) },
      field: "content",
    },
  ] as const)(
    "POST /posts/${postId}/comments -> status 400 (validation errors)",
    async ({ payload, field }) => {
      const { postRes, accessToken } = await setupUserLoginBlogPost(app);

      const responseRes = await request(app)
        .post(`${routersPaths.posts}/${postRes.id}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

      expect(responseRes.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.any(String),
            field,
          }),
        ])
      );
    }
  );

  // * return status 401
  it("should return 401 without authorization", async () => {
    const { postRes } = await setupUserLoginBlogPost(app);
    const commentDto = getCommentForPostDto();

    await request(app)
      .post(`${routersPaths.posts}/${postRes.id}/comments`)
      .send(commentDto)
      .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });

  // * return status 404
  it("should return 404 for invalid postId format", async () => {
    const { accessToken } = await setupUserLoginBlogPost(app);
    const commentDto = getCommentForPostDto();

    const invalidPostId = "invalid-post-id";

    await request(app)
      .post(`${routersPaths.posts}/${invalidPostId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(commentDto)
      .expect(HTTP_STATUS_CODES.NOT_FOUND_404);
  });
});
