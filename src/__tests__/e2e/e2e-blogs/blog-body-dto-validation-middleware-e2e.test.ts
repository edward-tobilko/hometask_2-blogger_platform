import express from "express";
import request from "supertest";

import { setupApp } from "../../../app";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { clearDB } from "../../utils/clear-db";
import { BLOGS_PATH } from "../../../core/paths/paths";
import { BlogInputDtoModel } from "../../../blogs/types/blog.types";
import { getBlogDtoUtil } from "../../utils/blogs/get-blog-dto.util";
import { runDB, stopDB } from "../../../db/mongo.db";
import { SETTINGS_MONGO_DB } from "../../../core/settings/setting-mongo-db";
import { createBlogUtil } from "../../utils/blogs/create-blog.util";
import { generateBasicAuthToken } from "../../utils/generate-admin-auth-token";

const testBlogDataDto: BlogInputDtoModel = getBlogDtoUtil();

describe("Create (POST) blogs API body dto validation ", () => {
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
    const createBlogResponse = await createBlogUtil(app, testBlogDataDto);

    expect(createBlogResponse).toMatchObject({
      name: testBlogDataDto.name,
      description: testBlogDataDto.description,
      websiteUrl: testBlogDataDto.websiteUrl,
    });

    // * Перевіряємо поля, які генерує сервер
    expect(createBlogResponse).toHaveProperty("id", expect.any(String));
    expect(createBlogResponse).toHaveProperty("createdAt", expect.any(String));
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
        .set("Authorization", generateBasicAuthToken())
        .send(payload)
        .expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

      expect(createBlogResponse.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.any(String),
            field, // for example -> name
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

// ? toMatchObject -  allows you to check only essential fields without requiring a 100% match of objects.
