import express from "express";
import request from "supertest";

import { generateBasicAuthToken } from "../utils/generate-admin-auth-token";
import { setupApp } from "../../../app";
import { clearDB } from "../utils/clear-db";
import { runDB, stopDB } from "../../../db/mongo.db";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { createPostUtil } from "../utils/posts/create-post.util";
import { getPostDtoUtil } from "../utils/posts/get-post-dto.util";
import { createBlogUtil } from "../utils/blogs/create-blog.util";
import { getPostByIdResponseCodeUtil } from "../utils/posts/get-post-by-id.util";
import { routersPaths } from "../../../core/paths/paths";
import { CreatePostRP } from "posts/routes/request-payload-types/create-post.request-payload-types";
import { appConfig } from "@core/settings/config";

const adminToken = generateBasicAuthToken();

describe("E2E delete post tests", () => {
  const app = express();
  setupApp(app);

  // * prepare the base we need for the post
  // let createdBlog: { id: string; name: string };
  let postDataDto: CreatePostRP;

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);
  });

  beforeEach(async () => {
    clearDB(app);

    // * create a blog after connecting to the db
    const createdBlogResponse = await createBlogUtil(app);

    // * creating a valid DTO post for this blog
    postDataDto = getPostDtoUtil(createdBlogResponse.id);
  });

  afterAll(async () => {
    await stopDB();
  });

  it("DELETE: /posts/:id -> status 204 - should remove post and check after GET - status 404", async () => {
    const createdPostResponse = await createPostUtil(app, postDataDto);

    await request(app)
      .delete(`${routersPaths.posts}/${createdPostResponse.id}`)
      .set("Authorization", adminToken)
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    const deletedPostResult = await getPostByIdResponseCodeUtil(
      app,
      createdPostResponse.id
    );

    expect(deletedPostResult.status).toBe(HTTP_STATUS_CODES.NOT_FOUND_404);
  });

  it("status 401 - if no Authorization", async () => {
    const createdPost = await createPostUtil(app, postDataDto);

    await request(app)
      .delete(`${routersPaths.posts}/${createdPost.id}`)
      .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });

  it("status 404 - if post not found", async () => {
    const nonExistingPostId = "507f1f77bcf86cd799439011";

    await request(app)
      .delete(`${routersPaths.posts}/${nonExistingPostId}`)
      .set("Authorization", adminToken)
      .expect(HTTP_STATUS_CODES.NOT_FOUND_404);
  });
});
