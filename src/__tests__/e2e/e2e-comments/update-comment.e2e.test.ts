import express from "express";
import request from "supertest";

import { setupApp } from "app";
import { runDB, stopDB } from "db/mongo.db";
import { clearDB } from "__tests__/utils/clear-db";
import { appConfig } from "@core/settings/config";
import { setupUserLoginBlogPost } from "__tests__/utils/posts/setup-user-login-blog-post.util";
import { createCommentForPost } from "__tests__/utils/posts/create-comment-for-post.util";
import { updateComment } from "__tests__/utils/comments/update-comment.util";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { getCommentById } from "__tests__/utils/comments/get-comment.util";
import { routersPaths } from "@core/paths/paths";
import { createUserBodyDto } from "__tests__/utils/users/create-user.util";
import { getUserDto } from "__tests__/utils/users/get-user-dto.util";
import { createAuthLogin } from "__tests__/utils/auth/auth-login.util";

describe("E2E update comment tests", () => {
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

  // * return status 204
  it("should update comment and return 204", async () => {
    const { postRes, accessToken } = await setupUserLoginBlogPost(app);

    const comment = await createCommentForPost(app, postRes.id, accessToken);

    const updatedContent =
      "Updated comment content with enough characters to pass validation";

    await updateComment(app, comment.id, accessToken, updatedContent).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );

    // * Проверяем, что комментарий обновился (через GET /comments/:id)
    const updatedComment = await getCommentById(app, comment.id)
      .send(updatedContent)
      .expect(HTTP_STATUS_CODES.OK_200);

    expect(updatedComment.body.content).toBe(updatedContent);
    expect(updatedComment.body.id).toBe(comment.id);
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

      const comment = await createCommentForPost(app, postRes.id, accessToken);

      const responseRes = await request(app)
        .put(`${routersPaths.comments}/${comment.id}`)
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
    const { postRes, accessToken } = await setupUserLoginBlogPost(app);

    const comment = await createCommentForPost(app, postRes.id, accessToken);

    // * Пытаемся обновить БЕЗ токена
    await request(app)
      .put(`${routersPaths.comments}/${comment.id}`)
      .send({
        content: "Updated content with enough characters",
      })
      .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });

  // * return status 403
  it("should return 403 if trying to edit someone else's comment", async () => {
    // * Create the firth user
    const user1Dto = getUserDto();
    await createUserBodyDto(app, user1Dto);

    const login1Res = await createAuthLogin(app, {
      loginOrEmail: user1Dto.login,
      password: user1Dto.password,
    }).expect(HTTP_STATUS_CODES.OK_200);

    const accessToken1 = login1Res.body.accessToken;

    // * Create the other user
    const user2Dto = getUserDto();
    await createUserBodyDto(app, user2Dto);

    const login2Res = await createAuthLogin(app, {
      loginOrEmail: user2Dto.login,
      password: user2Dto.password,
    }).expect(HTTP_STATUS_CODES.OK_200);

    const accessToken2 = login2Res.body.accessToken;

    // * Create blog and post
    const { postRes } = await setupUserLoginBlogPost(app);

    // * Create a comment
    const comment = await createCommentForPost(app, postRes.id, accessToken1);

    // * User2 try update comment User1
    await request(app)
      .put(`${routersPaths.comments}/${comment.id}`)
      .set("Authorization", `Bearer ${accessToken2}`)
      .send({
        content:
          "Trying to update someone else's comment with enough characters",
      })
      .expect(HTTP_STATUS_CODES.FORBIDDEN_403);
  });

  // * return status 404
  it("should return 404 if comment does not exist", async () => {
    const { accessToken } = await setupUserLoginBlogPost(app);

    const fakeCommentId = "507f1f77bcf86cd799439011"; // Valid ObjectId but not found

    await updateComment(app, fakeCommentId, accessToken)
      .send({
        content: "Trying to update non-existing comment with enough characters",
      })
      .expect(HTTP_STATUS_CODES.NOT_FOUND_404);
  });

  it("should return 404 for invalid commentId format", async () => {
    const { accessToken } = await setupUserLoginBlogPost(app);

    const invalidCommentId = "invalid-comment-id"; //  Invalid ObjectId

    await updateComment(app, invalidCommentId, accessToken)
      .send({
        content:
          "Trying to update with invalid ID format and enough characters",
      })
      .expect(HTTP_STATUS_CODES.NOT_FOUND_404);
  });
});
