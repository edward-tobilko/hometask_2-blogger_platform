import express from "express";
import request from "supertest";

import { setupApp } from "../../../app";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { clearDB } from "../../utils/clear-db";
import { BLOGS_PATH } from "../../../core/paths/paths";
import { generateBasicAuthToken } from "../../utils/generate-admin-auth-token";
import { BlogInputDto } from "../../../blogs/types/blog.types";
import { getBlogDtoUtil } from "../../utils/blogs/get-blog-dto.util";
import { runDB, stopDB } from "../../../db/mongo.db";
import { SETTINGS_MONGO_DB } from "../../../core/settings/setting-mongo-db";

const adminToken = generateBasicAuthToken();

const testBlogDataDto: BlogInputDto = getBlogDtoUtil();

describe("Create (POST) blogs API body validation ", () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await runDB(SETTINGS_MONGO_DB.MONGO_URL);
    await clearDB(app);
  });

  afterAll(async () => {
    await stopDB();
  });

  it("201 - when payload is valid", async () => {
    const createBlogResponse = await request(app)
      .post(BLOGS_PATH)
      .set("Authorization", adminToken)
      .send(testBlogDataDto)
      .expect(HTTP_STATUS_CODES.CREATED_201);

    expect(createBlogResponse.body).toEqual({
      ...testBlogDataDto,
      id: expect.any(String),
    });
  });

  it.each([
    {
      name: "name is a string",
      payload: { ...testBlogDataDto, name: 2 },
      field: "name",
    },
    {
      name: "name length > 15 symbols",
      payload: { ...testBlogDataDto, name: "name".repeat(16) },
      field: "name",
    },

    {
      name: "description is a string",
      payload: { ...testBlogDataDto, description: 2 },
      field: "description",
    },
    {
      name: "description length > 500 symbols",
      payload: { ...testBlogDataDto, description: "description".repeat(501) },
      field: "description",
    },

    {
      name: "website url is too long",
      payload: {
        ...testBlogDataDto,
        websiteUrl: "https://site.com/" + "blogggggggs".repeat(90),
      },
      field: "websiteUrl",
    },
    {
      name: "website url is invalid (no https)",
      payload: { ...testBlogDataDto, websiteUrl: "http://site.com" },
      field: "websiteUrl",
    },
    {
      name: "website url is invalid (random string)",
      payload: { ...testBlogDataDto, websiteUrl: "not-a-url" },
      field: "websiteUrl",
    },
  ] as const)(
    "400 - should not create blog if the inputModel has incorrect values",
    async ({ name, payload, field }) => {
      const createBlogResponse = await request(app)
        .post(BLOGS_PATH)
        .set("Authorization", adminToken)
        .send(payload)
        .expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

      expect(createBlogResponse.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field,
            message: expect.any(String),
          }),
        ])
      );
    }
  );

  it("401 - when no Authorization header", async () => {
    await request(app)
      .post(BLOGS_PATH)
      .send(testBlogDataDto)
      .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });
});
