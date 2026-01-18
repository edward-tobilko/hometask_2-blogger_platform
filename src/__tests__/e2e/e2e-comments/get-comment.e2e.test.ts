import express from "express";

import { setupApp } from "app";
import { runDB, stopDB } from "db/mongo.db";
import { clearDB } from "../utils/clear-db";
import { appConfig } from "@core/settings/config";
import { createCommentForPost } from "../utils/posts/create-comment-for-post.util";
import { setupUserLoginBlogPost } from "../utils/posts/setup-user-login-blog-post.util";
import { getCommentById } from "../utils/comments/get-comment.util";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

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

  // * return status 200
  it("GET /comments/:id -> status 200  and returns comment view model", async () => {
    // * setup user
    const { postRes, accessToken } = await setupUserLoginBlogPost(app);

    // * create comment
    const createdCommentRes = await createCommentForPost(
      app,
      postRes.id,
      accessToken
    );

    // * get comment by id
    const fetchedCommentRes = await getCommentById(app, createdCommentRes.id);

    expect(fetchedCommentRes.body).toEqual(
      expect.objectContaining({
        id: createdCommentRes.id,
        content: createdCommentRes.content,

        commentatorInfo: expect.objectContaining({
          userId: expect.any(String),
          userLogin: createdCommentRes.commentatorInfo.userLogin,
        }),

        createdAt: expect.any(String),
      })
    );
  });

  // * return status 404
  it("should return 404 if comment is not found", async () => {
    const fakeId = "507f1f77bcf86cd799439011"; // валидный ObjectId, но комментария нет

    await getCommentById(app, fakeId).expect(HTTP_STATUS_CODES.NOT_FOUND_404);
  });

  it("should return 404 for invalid id format", async () => {
    const invalidId = "invalid-id-123";

    await getCommentById(app, invalidId).expect(
      HTTP_STATUS_CODES.NOT_FOUND_404
    );
  });
});
