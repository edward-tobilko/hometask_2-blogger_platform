import express from "express";
import request from "supertest";

import { setupApp } from "../../app";
import { HTTP_STATUS_CODES } from "../../core/utils/http-statuses.util";
import { clearDB } from "../utils/clear-db";
import { generateBasicAuthToken } from "../utils/generate-admin-auth-token";
import { PostInputDtoTypeModel, PostTypeModel } from "../../types/post.types";
import { BLOGS_PATH, POSTS_PATH } from "../../core/paths/paths";
import { BlogTypeModel } from "../../types/blog.types";

const adminToken = generateBasicAuthToken();

describe("E2E Posts API tests", () => {
  const app = express();
  setupApp(app);

  let blog: BlogTypeModel;
  let title1 = "new title-1";
  let title2 = "new title-2";
  let shortDescription1 = "new short description-1";
  let shortDescription2 = "new short description-2";

  // * Helper functions
  const testValidDtoPost = (blogId: number) =>
    ({
      title: "test title",
      shortDescription: "test short desc",
      content: "test content",
      blogId,
    }) as PostInputDtoTypeModel;

  const createPostResponse = async (
    title: string,
    shortDescription: string,
    blogId: number
  ) => {
    const response = await request(app)
      .post(POSTS_PATH)
      .set("Authorization", adminToken)
      .send({
        ...testValidDtoPost(blogId),
        title: title,
        shortDescription: shortDescription,
      })
      .expect(HTTP_STATUS_CODES.CREATED_201);

    return response.body as PostTypeModel;
  };

  beforeEach(async () => {
    await clearDB(app);

    // * створюємо валідний блог і тримаємо його для тестів
    const blogResultResponse = await request(app)
      .post(BLOGS_PATH)
      .set("Authorization", adminToken)
      .send({
        name: "name",
        description: "description",
        websiteUrl: "https://example.com",
      })
      .expect(HTTP_STATUS_CODES.CREATED_201);

    blog = blogResultResponse.body as BlogTypeModel;
  });

  it("GET: /posts -> should return posts list - 200", async () => {
    await createPostResponse(title1, shortDescription1, blog.id);
    await createPostResponse(title2, shortDescription2, blog.id);

    const postListResponse = await request(app)
      .get(POSTS_PATH)
      .expect(HTTP_STATUS_CODES.OK_200);

    expect(Array.isArray(postListResponse.body)).toBe(true);
    expect(postListResponse.body.length).toBeGreaterThanOrEqual(2);
  });

  it("POST: /posts -> should create new post - 201", async () => {
    const getCreatedPostResponse = await createPostResponse(
      title1,
      shortDescription1,
      blog.id
    );

    expect(getCreatedPostResponse).toEqual(
      expect.objectContaining({
        ...testValidDtoPost(blog.id),
        id: expect.any(Number),
        title: title1,
        shortDescription: shortDescription1,
        blogId: blog.id,
        blogName: blog.name,
      })
    );
  });

  it("GET: /posts/:id -> should return one post by id - 200", async () => {
    const getCreatedPostResponse = await createPostResponse(
      title1,
      shortDescription1,
      blog.id
    );

    const postResponse = await request(app)
      .get(`${POSTS_PATH}/${getCreatedPostResponse.id}`)
      .expect(HTTP_STATUS_CODES.OK_200);

    expect(postResponse.body).toEqual(
      expect.objectContaining(getCreatedPostResponse)
    );
  });

  it("GET: /posts/:id -> should NOT return post by id (If post for passed id does not exist) - 404", async () => {
    await request(app)
      .get(`${POSTS_PATH}/99999`)
      .expect(HTTP_STATUS_CODES.NOT_FOUND_404);

    await request(app)
      .get(`${POSTS_PATH}/abc`)
      .expect(HTTP_STATUS_CODES.BAD_REQUEST_400);
  });

  it("PUT: /posts/:id -> should update post by id - 204", async () => {
    const getResponseCreatedPostResult = await createPostResponse(
      title1,
      shortDescription1,
      blog.id
    );

    const updatedDtoPost: PostInputDtoTypeModel = {
      ...testValidDtoPost(blog.id),
      title: "updated title",
      blogId: blog.id,
    };

    await request(app)
      .put(`${POSTS_PATH}/${getResponseCreatedPostResult.id}`)
      .set("Authorization", adminToken)
      .send(updatedDtoPost)
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    const getResponseUpdatedPostResult = await request(app)
      .get(`${POSTS_PATH}/${getResponseCreatedPostResult.id}`)
      .expect(HTTP_STATUS_CODES.OK_200);

    expect(getResponseUpdatedPostResult.body).toEqual(
      expect.objectContaining({
        ...updatedDtoPost,
        id: getResponseCreatedPostResult.id,
        blogId: blog.id,
      })
    );
  });

  it("DELETE: /posts/:id -> should remove post by id and check after NOT FOUND", async () => {
    const getResponseCreatedPostResult = await createPostResponse(
      title1,
      shortDescription1,
      blog.id
    );

    await request(app)
      .delete(`${POSTS_PATH}/${getResponseCreatedPostResult.id}`)
      .set("Authorization", adminToken)
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    const getResponseDeletedPostResult = await request(app).get(
      `${POSTS_PATH}/${getResponseCreatedPostResult.id}`
    );

    expect(getResponseDeletedPostResult.status).toBe(
      HTTP_STATUS_CODES.NOT_FOUND_404
    );
  });
});
