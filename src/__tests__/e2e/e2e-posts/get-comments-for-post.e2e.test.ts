import express from "express";

import { setupApp } from "../../../app";
import { clearDB } from "../../utils/clear-db";
import { runDB, stopDB } from "../../../db/mongo.db";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { appConfig } from "@core/settings/config";
import { createCommentForPost } from "__tests__/utils/posts/create-comment-for-post.util";
import { getCommentsList } from "__tests__/utils/posts/get-comments-list.util";
import { setupUserLoginBlogPost } from "__tests__/utils/posts/setup-user-login-blog-post.util";

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

  // * return status 200
  it("GET: /posts/${postId}/comments -> status 200 - should return comments list (12 comment with pagination)", async () => {
    // * Создаем пользователя и логинимся
    const { postRes, accessToken } = await setupUserLoginBlogPost(app);

    // * create 12 comments
    for (let i = 1; i <= 12; i++) {
      await createCommentForPost(app, postRes.id, accessToken);
    }

    // * на 1й сторанице -> pageSize=10 (totalCount=12, pagesCount=2)
    const page1 = await getCommentsList(app, postRes.id, {
      query: { pageNumber: 1, pageSize: 10 },
    }).expect(HTTP_STATUS_CODES.OK_200);

    expect(page1.body.page).toBe(1);
    expect(page1.body.pageSize).toBe(10);
    expect(page1.body.totalCount).toBe(12);
    expect(page1.body.pagesCount).toBe(2);

    expect(page1.body.items).toHaveLength(10);

    // * на 2й сторанице -> pageSize=2 (totalCount=12, pagesCount=2)
    const page2 = await getCommentsList(app, postRes.id, {
      query: { pageNumber: 2, pageSize: 10 },
    }).expect(HTTP_STATUS_CODES.OK_200);

    expect(page2.body.page).toBe(2);
    expect(page2.body.pageSize).toBe(10);
    expect(page2.body.totalCount).toBe(12);
    expect(page2.body.pagesCount).toBe(2);

    expect(page2.body.items).toHaveLength(2);
  });

  // * return status 404
  it("should return 404 if post does not exist", async () => {
    const fakePostId = "507f1f77bcf86cd799439011";

    await getCommentsList(app, fakePostId).expect(
      HTTP_STATUS_CODES.NOT_FOUND_404
    );
  });
});
