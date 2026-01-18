import express from "express";
import request from "supertest";

import { setupApp } from "../../../app";
import { clearDB } from "../../utils/clear-db";
import { runDB, stopDB } from "../../../db/mongo.db";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { appConfig } from "@core/settings/config";
import { createCommentForPost } from "__tests__/utils/posts/create-comment-for-post.util";
import { setupUserLoginBlogPost } from "__tests__/utils/posts/setup-user-login-blog-post.util";
import { getUserDto } from "__tests__/utils/users/get-user-dto.util";
import { createUserBodyDto } from "__tests__/utils/users/create-user.util";
import { createAuthLogin } from "__tests__/utils/auth/auth-login.util";
import { deleteCommentById } from "__tests__/utils/comments/delete-comment.util";
import { routersPaths } from "@core/paths/paths";

describe("E2E delete comment tests", () => {
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
  it("status 204 - should remove comment", async () => {
    const { postRes, accessToken } = await setupUserLoginBlogPost(app);
    const createdCommentRes = await createCommentForPost(
      app,
      postRes.id,
      accessToken
    );

    await deleteCommentById(app, createdCommentRes.id, accessToken).expect(
      HTTP_STATUS_CODES.NO_CONTENT_204
    );
  });

  // * return status 401
  it("status 401 - if no Authorization", async () => {
    const { postRes, accessToken } = await setupUserLoginBlogPost(app);
    const createdCommentRes = await createCommentForPost(
      app,
      postRes.id,
      accessToken
    );

    await request(app)
      .delete(`${routersPaths.comments}/${createdCommentRes.id}`)
      .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });

  // * return status 403
  it("should return 403 if trying to edit someone else's comment", async () => {
    const { postRes, accessToken: token1 } = await setupUserLoginBlogPost(app);

    // * User create a comment
    const comment = await createCommentForPost(app, postRes.id, token1);

    // * Create the other user
    const user2Dto = getUserDto();
    await createUserBodyDto(app, user2Dto);

    const login2Res = await createAuthLogin(app, {
      loginOrEmail: user2Dto.login,
      password: user2Dto.password,
    }).expect(HTTP_STATUS_CODES.OK_200);

    const token2 = login2Res.body.accessToken;

    // * User2 trying delete comment User1
    await deleteCommentById(app, comment.id, token2).expect(
      HTTP_STATUS_CODES.FORBIDDEN_403
    );
  });

  // * return status 404
  it("status 404 - if comment not found", async () => {
    const { accessToken } = await setupUserLoginBlogPost(app);

    const nonExistingCommentId = "507f1f77bcf86cd799439011";

    await deleteCommentById(app, nonExistingCommentId, accessToken).expect(
      HTTP_STATUS_CODES.NOT_FOUND_404
    );
  });

  it("status 404 - if commentId is invalid", async () => {
    const { accessToken } = await setupUserLoginBlogPost(app);

    const invalidCommentId = "invalid-comment-id";

    await deleteCommentById(app, invalidCommentId, accessToken).expect(
      HTTP_STATUS_CODES.NOT_FOUND_404
    );
  });
});
