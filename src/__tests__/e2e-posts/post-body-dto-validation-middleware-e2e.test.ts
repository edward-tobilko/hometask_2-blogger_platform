import express from "express";
import request from "supertest";

import { setupApp } from "../../app";
import { HTTP_STATUS_CODES } from "../../core/utils/http-statuses.util";
import { clearDB } from "../utils/clear-db";
import { BLOGS_PATH, POSTS_PATH } from "../../core/paths/paths";
import { generateBasicAuthToken } from "../utils/generate-admin-auth-token";
import { PostInputDtoTypeModel } from "../../types/post.types";
import { errorMessages } from "../../core/utils/error-messages.util";
import { ErrorMessagesTypeModel } from "../../types/error-messages.types";
import { BlogTypeModel } from "../../types/blog.types";

const adminToken = generateBasicAuthToken();

describe("Create (POST) posts API body validation ", () => {
  const app = express();
  setupApp(app);

  const testValidDtoPost = (blogId: number) =>
    ({
      title: "test title",
      shortDescription: "test short desc",
      content: "test content",
      blogId,
    }) as PostInputDtoTypeModel;

  async function createBlogAndGetIdAndName() {
    const result = await request(app)
      .post(BLOGS_PATH)
      .set("Authorization", adminToken)
      .send({
        name: "blog name",
        description: "blog desc",
        websiteUrl: "https://example.com",
      })
      .expect(HTTP_STATUS_CODES.CREATED_201);

    return result.body as BlogTypeModel;
  }

  beforeEach(async () => {
    await clearDB(app);
  });

  it("201 - when payload is valid", async () => {
    const blog = await createBlogAndGetIdAndName();

    const createPostResponse = await request(app)
      .post(POSTS_PATH)
      .set("Authorization", adminToken)
      .send(testValidDtoPost(blog.id))
      .expect(HTTP_STATUS_CODES.CREATED_201);

    expect(createPostResponse.body).toEqual({
      ...testValidDtoPost(blog.id),
      id: expect.any(Number),
      blogId: blog.id,
      blogName: blog.name,
    });
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
      const blog = await createBlogAndGetIdAndName();

      const createPostResponse = await request(app)
        .post(POSTS_PATH)
        .set("Authorization", adminToken)
        .send({ ...testValidDtoPost(blog.id), ...payload })
        .expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

      const { errorsMessages } = errorMessages(
        createPostResponse.body.errorsMessages as ErrorMessagesTypeModel[]
      );

      expect(errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field,
            message: expect.any(String),
          }),
        ])
      );
    }
  );

  it("400 - blogId does not exist", async () => {
    const blogId = 999999;

    const result = await request(app)
      .post(POSTS_PATH)
      .set("Authorization", adminToken)
      .send(testValidDtoPost(blogId))
      .expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

    const { errorsMessages } = errorMessages(
      result.body.errorsMessages as ErrorMessagesTypeModel[]
    );

    expect(errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "blogId",
          message: expect.stringContaining("does not exist"),
        }),
      ])
    );
  });

  it("401 - when no Authorization header", async () => {
    const blog = await createBlogAndGetIdAndName();

    await request(app)
      .post(POSTS_PATH)
      .send(testValidDtoPost(blog.id))
      .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });
});
