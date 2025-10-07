import express from "express";
import request from "supertest";

import { generateBasicAuthToken } from "../../utils/generate-admin-auth-token";
import { setupApp } from "../../../app";
import { clearDB } from "../../utils/clear-db";
import { runDB, stopDB } from "../../../db/mongo.db";
import { SETTINGS_MONGO_DB } from "../../../core/settings/setting-mongo-db";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { POSTS_PATH } from "../../../core/paths/paths";
import { createPostUtil } from "../../utils/posts/create-post.util";
import { PostInputDto } from "../../../posts/types/post.types";
import { getPostDtoUtil } from "../../utils/posts/get-post-dto.util";
import { createBlogUtil } from "../../utils/blogs/create-blog.util";
import {
  getPostByIdBodyUtil,
  getPostByIdResponseCodeUtil,
} from "../../utils/posts/get-post-by-id.util";

const adminToken = generateBasicAuthToken();

describe("E2E Posts API tests", () => {
  const app = express();
  setupApp(app);

  // * підготовлюємо базу, яку нам потрібно для посту
  let createdBlog: { id: string; name: string };
  let postDataDto: PostInputDto;

  beforeAll(async () => {
    await runDB(SETTINGS_MONGO_DB.MONGO_URL);
    await clearDB(app);

    // * створюємо блог після підключення до БД
    const createdBlogResponse = await createBlogUtil(app);
    createdBlog = {
      id: createdBlogResponse.id,
      name: createdBlogResponse.name,
    };

    // * формуємо валідний DTO поста під цей блог
    postDataDto = getPostDtoUtil(createdBlog.id);
  });

  afterAll(async () => {
    await stopDB();
  });

  it("GET: /posts -> should return posts list - 200", async () => {
    await createPostUtil(app, postDataDto);
    await createPostUtil(app, postDataDto);

    const postListResponse = await request(app)
      .get(POSTS_PATH)
      .expect(HTTP_STATUS_CODES.OK_200);

    expect(Array.isArray(postListResponse.body)).toBe(true);
    expect(postListResponse.body.length).toBeGreaterThanOrEqual(2);
  });

  it("POST: /posts -> should create new post - 201", async () => {
    const createdPostResponse = await createPostUtil(app, postDataDto);

    expect(createdPostResponse).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: postDataDto.title,
        shortDescription: postDataDto.shortDescription,
        blogId: createdBlog.id,
        blogName: createdBlog.name,
        createdAt: expect.any(String),
      })
    );
  });

  it("GET: /posts/:id -> should return one post by id - 200", async () => {
    const createdPostResponse = await createPostUtil(app, postDataDto);

    const postResponse = await getPostByIdBodyUtil(app, createdPostResponse.id);

    expect(postResponse).toEqual(expect.objectContaining(createdPostResponse));
  });

  it("GET: /posts/:id -> should NOT return post by id (If post for passed id does not exist) - 404", async () => {
    await request(app)
      .get(`${POSTS_PATH}/507f1f77bcf86cd799439011`)
      .expect(HTTP_STATUS_CODES.NOT_FOUND_404);

    await request(app)
      .get(`${POSTS_PATH}/507f1f77bcf86cd799439011`)
      .expect(HTTP_STATUS_CODES.NOT_FOUND_404);
  });

  it("PUT: /posts/:id -> should update post by id - 204", async () => {
    const createdPostResponse = await createPostUtil(app, postDataDto);

    const updatedDtoPost: PostInputDto = {
      ...postDataDto,
      title: "updated title",
      blogId: createdBlog.id,
    };

    await request(app)
      .put(`${POSTS_PATH}/${createdPostResponse.id}`)
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

  it("DELETE: /posts/:id -> should remove post by id and check after NOT FOUND", async () => {
    const createdPostResponse = await createPostUtil(app, postDataDto);

    await request(app)
      .delete(`${POSTS_PATH}/${createdPostResponse.id}`)
      .set("Authorization", adminToken)
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    const deletedPostResult = await getPostByIdResponseCodeUtil(
      app,
      createdPostResponse.id
    );

    expect(deletedPostResult.status).toBe(HTTP_STATUS_CODES.NOT_FOUND_404);
  });
});
