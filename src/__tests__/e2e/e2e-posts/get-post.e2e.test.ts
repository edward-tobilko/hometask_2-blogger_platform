import express from "express";
import request from "supertest";

import { setupApp } from "../../../app";
import { clearDB } from "../../utils/clear-db";
import { runDB, stopDB } from "../../../db/mongo.db";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { createPostUtil } from "../../utils/posts/create-post.util";
import { getPostDtoUtil } from "../../utils/posts/get-post-dto.util";
import { createBlogUtil } from "../../utils/blogs/create-blog.util";
import { getPostByIdBodyUtil } from "../../utils/posts/get-post-by-id.util";
import { routersPaths } from "../../../core/paths/paths";
import { CreatePostRP } from "posts/routes/request-payload-types/create-post.request-payload-types";
import { appConfig } from "@core/settings/config";

describe("E2E get post tests", () => {
  const app = express();
  setupApp(app);

  // * prepare the base we need for the post
  let createdBlog: { id: string; name: string };
  let postDataDto: CreatePostRP;

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);
    await clearDB(app);

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
    await stopDB();
  });

  it("GET: /posts/:id -> should return one post by id - status 200", async () => {
    const createdPostResponse = await createPostUtil(app, postDataDto);

    const postResponse = await getPostByIdBodyUtil(app, createdPostResponse.id);

    expect(postResponse).toEqual(expect.objectContaining(createdPostResponse));
  });

  it("GET: /posts/:id -> should NOT return post by id (If post for passed id does not exist) - status 404", async () => {
    await request(app)
      .get(`${routersPaths.posts}/507f1f77bcf86cd799439011`)
      .expect(HTTP_STATUS_CODES.NOT_FOUND_404);

    await request(app)
      .get(`${routersPaths.posts}/507f1f77bcf86cd799439011`)
      .expect(HTTP_STATUS_CODES.NOT_FOUND_404);
  });
});
