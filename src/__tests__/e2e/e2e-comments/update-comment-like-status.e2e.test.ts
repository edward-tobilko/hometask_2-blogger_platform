import express from "express";
import mongoose from "mongoose";
import request from "supertest";

import { setupApp } from "app";
import { runMongoose, stopMongoose } from "db/mongoose.db";
import { clearDb } from "../utils/clear-db";
import { setupUserLoginBlogPost } from "../utils/posts/setup-user-login-blog-post.util";
import { createCommentForPost } from "../utils/posts/create-comment-for-post.util";
import { getCommentById } from "../utils/comments/get-comment.util";
import { putLikeStatus } from "../utils/comments/update-like-status.util";
import { LikeStatus } from "@core/types/like-status.enum";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { routersPaths } from "@core/paths/paths";

describe("E2E comments like status tests", () => {
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

    await mongoose.disconnect().catch(() => {}); // страховочный disconnect
  });

  it("PUT: /comments/:commentId/like-status -> create like, update counters (status 204)", async () => {
    const { postRes, accessToken } = await setupUserLoginBlogPost(app);

    const createdCommentRes = await createCommentForPost(
      app,
      postRes.id,
      accessToken
    );

    // * Initial state
    const beforeLike = await getCommentById(app, createdCommentRes.id);
    expect(beforeLike.body.likesInfo).toEqual(
      expect.objectContaining({
        likesCount: 0,
        dislikesCount: 0,
        myStatus: expect.any(String), // default -> None
      })
    );

    // * Set like
    await putLikeStatus(
      app,
      createdCommentRes.id,
      accessToken,
      LikeStatus.Like
    ).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    // * Check of comment view
    const afterLike = await getCommentById(app, createdCommentRes.id);
    expect(afterLike.body.likesInfo).toEqual(
      expect.objectContaining({
        likesCount: 1,
        dislikesCount: 0,
        myStatus: expect.any(String),
      })
    );

    // * Double like - nothing to change
    await putLikeStatus(
      app,
      createdCommentRes.id,
      accessToken,
      LikeStatus.Like
    ).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    const afterSameLike = await getCommentById(app, createdCommentRes.id);
    expect(afterSameLike.body.likesInfo).toEqual(
      expect.objectContaining({
        likesCount: 1,
        dislikesCount: 0,
      })
    );

    // * Switch like -> dislike
    await putLikeStatus(
      app,
      createdCommentRes.id,
      accessToken,
      LikeStatus.Dislike
    ).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    const afterDisLike = await getCommentById(app, createdCommentRes.id);
    expect(afterDisLike.body.likesInfo).toEqual(
      expect.objectContaining({
        likesCount: 0,
        dislikesCount: 1,
        myStatus: expect.any(String),
      })
    );

    // * Reset to "None"
    await putLikeStatus(
      app,
      createdCommentRes.id,
      accessToken,
      LikeStatus.None
    ).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    const afterNone = await getCommentById(app, createdCommentRes.id);
    expect(afterNone.body.likesInfo).toEqual(
      expect.objectContaining({
        likesCount: 0,
        dislikesCount: 0,
        myStatus: expect.any(String),
      })
    );
  });

  it("PUT: /comments/:commentId/like-status -> without auth (status 401)", async () => {
    const { postRes, accessToken } = await setupUserLoginBlogPost(app);

    const createdCommentRes = await createCommentForPost(
      app,
      postRes.id,
      accessToken
    );

    await request(app)
      .put(`${routersPaths.comments}/${createdCommentRes.id}/like-status`)
      .send({ likeStatus: LikeStatus.Like })
      .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });

  it("PUT: /comments/:commentId/like-status -> when likeStatus invalid (status 400)", async () => {
    const { postRes, accessToken } = await setupUserLoginBlogPost(app);

    const createdCommentRes = await createCommentForPost(
      app,
      postRes.id,
      accessToken
    );

    await putLikeStatus(
      app,
      createdCommentRes.id,
      accessToken,
      "BAD_STATUS"
    ).expect(HTTP_STATUS_CODES.BAD_REQUEST_400);
  });

  it("PUT: /comments/:commentId/like-status -> when commentId does not exist (status 404)", async () => {
    const { accessToken } = await setupUserLoginBlogPost(app);

    await putLikeStatus(
      app,
      "507f1f77bcf86cd799439011", // not existing commentId
      accessToken,
      LikeStatus.Like
    ).expect(HTTP_STATUS_CODES.NOT_FOUND_404);
  });
});
