import express from "express";
import request from "supertest";

import { generateBasicAuthToken } from "../../utils/generate-admin-auth-token";
import { setupApp } from "../../../app";
import { clearDB } from "../../utils/clear-db";
import { runDB, stopDB } from "../../../db/mongo.db";
import { SETTINGS_MONGO_DB } from "../../../core/settings/setting-mongo.db";
import { createPostUtil } from "../../utils/posts/create-post.util";
import { PostInputDtoModel } from "../../../posts/types/post.types";
import { getPostDtoUtil } from "../../utils/posts/get-post-dto.util";
import { createBlogUtil } from "../../utils/blogs/create-blog.util";
import { POSTS_PATH } from "../../../core/paths/paths";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { apiErrorResultUtil } from "../../../core/utils/api-error-result.util";
import { FieldError } from "../../../core/types/fields-only.type";

const adminToken = generateBasicAuthToken();

describe("Create (POST) posts API body validation ", () => {
  const app = express();
  setupApp(app);

  let validPostDto: PostInputDtoModel; // ready valid DTO with correct blogId
  let blogName: string;

  beforeAll(async () => {
    await runDB(SETTINGS_MONGO_DB.MONGO_URL);
    await clearDB(app);

    // * create a blog and collect a valid post on its ID
    const createdBlog = await createBlogUtil(app);
    validPostDto = getPostDtoUtil(createdBlog.id);
    blogName = createdBlog.name;
  });

  afterAll(async () => {
    await stopDB();
  });

  it("201 - when payload is valid", async () => {
    const createdPostResponse = await createPostUtil(app, validPostDto);

    expect(createdPostResponse).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: validPostDto.title,
        shortDescription: validPostDto.shortDescription,
        content: validPostDto.content,
        blogId: validPostDto.blogId,
        blogName, // from the repository by blogId
      })
    );
  });

  it.each([
    {
      name: "title is not a string",
      payload: { title: 123 },
      field: "title",
    },
    {
      name: "title length > 30 symbols",
      payload: { title: "new title".repeat(31) },
      field: "title",
    },

    {
      name: "shortDescription is not a string",
      payload: { shortDescription: 123 },
      field: "shortDescription",
    },
    {
      name: "shortDescription length > 100 symbols",
      payload: { shortDescription: "new desc".repeat(101) },
      field: "shortDescription",
    },

    {
      name: "content is not a string",
      payload: {
        content: 123,
      },
      field: "content",
    },
    {
      name: "content length > 1000 symbols",
      payload: { content: "new content".repeat(1001) },
      field: "content",
    },

    {
      name: "blogId not a string",
      payload: { blogId: 123 },
      field: "blogId",
    },
    {
      name: "blogId is empty",
      payload: { blogId: "" },
      field: "blogId",
    },
  ] as const)(
    "400 - should not create post if the inputModel has incorrect values",
    async ({ name, payload, field }) => {
      const createPostResponse = await request(app)
        .post(POSTS_PATH)
        .set("Authorization", adminToken)
        .send({ ...validPostDto, ...payload })
        .expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

      const { errorsMessages } = apiErrorResultUtil(
        createPostResponse.body.errorsMessages as FieldError[]
      );

      expect(errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.any(String),
            field,
          }),
        ])
      );
    }
  );

  it("400 - blogId does not exist", async () => {
    const nonExistingBlogId = "507f1f77bcf86cd799439011";

    const result = await request(app)
      .post(POSTS_PATH)
      .set("Authorization", adminToken)
      .send({ ...validPostDto, blogId: nonExistingBlogId })
      .expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

    const { errorsMessages } = apiErrorResultUtil(
      result.body.errorsMessages as FieldError[]
    );

    expect(errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("blogId is not exist"),
          field: "blogId",
        }),
      ])
    );
  });

  it("401 - when no Authorization header", async () => {
    await request(app)
      .post(POSTS_PATH)
      .send(validPostDto)
      .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });
});
