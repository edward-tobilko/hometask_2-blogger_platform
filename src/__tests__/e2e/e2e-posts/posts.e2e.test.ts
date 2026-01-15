import express from "express";
import request from "supertest";

import { generateBasicAuthToken } from "../../utils/generate-admin-auth-token";
import { setupApp } from "../../../app";
import { clearDB } from "../../utils/clear-db";
import { runDB, stopDB } from "../../../db/mongo.db";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { createPostUtil } from "../../utils/posts/create-post.util";
import { getPostDtoUtil } from "../../utils/posts/get-post-dto.util";
import { createBlogUtil } from "../../utils/blogs/create-blog.util";
import {
  getPostByIdBodyUtil,
  getPostByIdResponseCodeUtil,
} from "../../utils/posts/get-post-by-id.util";
import { routersPaths } from "../../../core/paths/paths";
import { CreatePostRP } from "posts/routes/request-payload-types/create-post.request-payload-types";
import { appConfig } from "@core/settings/config";

const adminToken = generateBasicAuthToken();

describe("E2E Posts API tests", () => {
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

  it("POST: /posts -> should create new post - status 201", async () => {
    const createdPostResponse = await createPostUtil(app, postDataDto);

    expect(createdPostResponse).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: postDataDto.title,
        shortDescription: postDataDto.shortDescription,
        content: postDataDto.content,
        blogId: createdBlog.id,
        blogName: createdBlog.name,
        createdAt: expect.any(String),
      })
    );
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

  it("PUT: /posts/:id -> should update post by id - status 204", async () => {
    const createdPostResponse = await createPostUtil(app, postDataDto);

    const updatedDtoPost: CreatePostRP = {
      ...postDataDto,
      title: "updated title",
      blogId: createdBlog.id,
    };

    await request(app)
      .put(`${routersPaths.posts}/${createdPostResponse.id}`)
      .set("Authorization", adminToken)
      .send(updatedDtoPost)
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    const updatedPostResult = await getPostByIdBodyUtil(
      app,
      createdPostResponse.id
    );

    expect(updatedPostResult).toEqual(
      expect.objectContaining({
        ...updatedDtoPost,
        id: createdPostResponse.id,
      })
    );
  });

  it("DELETE: /posts/:id -> should remove post by id and check after NOT FOUND - status 404", async () => {
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
});
