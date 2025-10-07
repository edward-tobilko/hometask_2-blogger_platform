import express from "express";
import request from "supertest";

import { setupApp } from "../../../app";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { BLOGS_PATH } from "../../../core/paths/paths";
import { clearDB } from "../../utils/clear-db";
import { generateBasicAuthToken } from "../../utils/generate-admin-auth-token";
import { createBlogUtil } from "../../utils/blogs/create-blog.util";
import { runDB, stopDB } from "../../../db/mongo.db";
import { SETTINGS_MONGO_DB } from "../../../core/settings/setting-mongo-db";
import { getBlogDtoUtil } from "../../utils/blogs/get-blog-dto.util";
import { BlogInputDto } from "../../../blogs/types/blog.types";
import { getBlogByIdUtil } from "../../utils/blogs/get-blog-by-id.util";

const adminToken = generateBasicAuthToken();

const testBlogDataDto: BlogInputDto = getBlogDtoUtil();

describe("E2E Blogs API tests", () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await runDB(SETTINGS_MONGO_DB.MONGO_URL);
    await clearDB(app);
  });

  afterAll(async () => {
    await stopDB();
  });

  it("GET: /blogs -> should return blogs list - 200", async () => {
    await createBlogUtil(app, {
      name: "test name-1",
      description: "test desc-1",
    });
    await createBlogUtil(app, {
      name: "test name-1",
      description: "test desc-1",
    });

    const blogListResponse = await request(app)
      .get(BLOGS_PATH)
      .expect(HTTP_STATUS_CODES.OK_200);

    expect(Array.isArray(blogListResponse.body)).toBe(true);
    expect(blogListResponse.body.length).toBeGreaterThanOrEqual(2);
  });

  it("POST: /blogs -> should create new blog - 201", async () => {
    const createdBlogResponse = await createBlogUtil(app, testBlogDataDto);

    expect(createdBlogResponse).toEqual(
      expect.objectContaining(testBlogDataDto)
    );
  });

  it("GET: /blogs/:id -> should return one blog by id - 200", async () => {
    const createdBlogResponse = await createBlogUtil(app, testBlogDataDto);

    const getBlogByIdResponse = await getBlogByIdUtil(
      app,
      createdBlogResponse.id
    );

    expect(getBlogByIdResponse).toEqual(
      expect.objectContaining(createdBlogResponse)
    );
  });

  it("GET: /blogs/:id -> should NOT return blog by id (If blog for passed id does not exist) - 404", async () => {
    await request(app)
      .get(`${BLOGS_PATH}/507f1f77bcf86cd799439011`)
      .expect(HTTP_STATUS_CODES.NOT_FOUND_404);

    await request(app)
      .get(`${BLOGS_PATH}/507f1f77bcf86cd799439011`)
      .expect(HTTP_STATUS_CODES.NOT_FOUND_404);
  });

  it("PUT: /blogs/:id -> should update blog by id - 204", async () => {
    const createdBlogResponse = await createBlogUtil(app, testBlogDataDto);

    const updatedDtoBlog = {
      ...testBlogDataDto,
      name: "updated name",
    };

    await request(app)
      .put(`${BLOGS_PATH}/${createdBlogResponse.id}`)
      .set("Authorization", adminToken)
      .send(updatedDtoBlog)
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    const updatedBlogResponse = await getBlogByIdUtil(
      app,
      createdBlogResponse.id
    );

    expect(updatedBlogResponse).toEqual({
      ...updatedDtoBlog,
      id: createdBlogResponse.id,
      createdAt: expect.any(String),
      isMembership: false,
    });
  });

  it("DELETE: /blogs/:id -> should remove blog by id and check after NOT FOUND", async () => {
    const createdBlogResponse = await createBlogUtil(app, testBlogDataDto);

    expect(typeof createdBlogResponse.id).toBe("string");

    await request(app)
      .delete(`${BLOGS_PATH}/${createdBlogResponse.id}`)
      .set("Authorization", adminToken)
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    await request(app)
      .get(`${BLOGS_PATH}/${createdBlogResponse.id}`)
      .expect(HTTP_STATUS_CODES.NOT_FOUND_404);
  });
});

// ? Пояснення:
// * toMatchObject -  дозволяє перевірити тільки суттєві поля, не вимагаючи 100% збігу об’єктів.
