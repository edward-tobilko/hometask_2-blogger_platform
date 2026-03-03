import express from "express";
import request from "supertest";

import { setupApp } from "../../../app";
import { clearDb } from "../utils/clear-db";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { createPostUtil } from "../utils/posts/create-post.util";
import { getPostDtoUtil } from "../utils/posts/get-post-dto.util";
import { createBlogUtil } from "../utils/blogs/create-blog.util";
import { routersPaths } from "../../../core/paths/paths";
import { CreatePostRP } from "posts/presentation/request-payload-types/create-post.request-payload-types";
import { runMongoose, stopMongoose } from "db/mongoose.db";

describe("E2E get posts tests", () => {
  const app = express();

  // * prepare the base we need for the post
  let createdBlog: { id: string; name: string };
  let postDataDto: CreatePostRP;

  beforeAll(async () => {
    await runMongoose();

    setupApp(app);

    await clearDb();

    // * create a blog after connecting to the db
    const createdBlogResponse = await createBlogUtil(app);
    createdBlog = {
      id: createdBlogResponse.id,
      name: createdBlogResponse.name,
    };

    // * creating a valid DTO post for this blog
    postDataDto = getPostDtoUtil(createdBlog.id);
  });

  afterAll(async () => {
    await stopMongoose();
  });

  it("GET: /posts -> should return posts list - status 200", async () => {
    await createPostUtil(app, postDataDto);
    await createPostUtil(app, postDataDto);

    const postListResponse = await request(app)
      .get(
        `${routersPaths.posts}?pageNumber=1&pageSize=5&sortBy=content&sortDirection=asc`
      )
      .expect(HTTP_STATUS_CODES.OK_200);

    expect(Array.isArray(postListResponse.body.items)).toBe(true);
    expect(postListResponse.body.items.length).toBeGreaterThanOrEqual(2);
  });
});
