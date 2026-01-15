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
import { routersPaths } from "../../../core/paths/paths";
import { CreatePostRP } from "posts/routes/request-payload-types/create-post.request-payload-types";
import { appConfig } from "@core/settings/config";

const adminToken = generateBasicAuthToken();

describe("E2E create post tests", () => {
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

  it.each([
    // * title validation
    {
      name: "title is not a string",
      payload: { title: 123 },
      field: "title",
    },
    {
      name: "title length > 30 symbols",
      payload: { title: "a".repeat(31) },
      field: "title",
    },

    // * shortDescription validation
    {
      name: "shortDescription is not a string",
      payload: { shortDescription: 123 },
      field: "shortDescription",
    },
    {
      name: "shortDescription length > 100 symbols",
      payload: { shortDescription: "a".repeat(101) },
      field: "shortDescription",
    },

    // * content validation
    {
      name: "content is not a string",
      payload: {
        content: 123,
      },
      field: "content",
    },
    {
      name: "content length > 1000 symbols",
      payload: { content: "a".repeat(1001) },
      field: "content",
    },

    // * blogId validation
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
    "status 400 - should not create post if the inputModel has incorrect values",
    async ({ payload, field }) => {
      const createPostResponse = await request(app)
        .post(routersPaths.posts)
        .set("Authorization", adminToken)
        .send({ ...postDataDto, ...payload })
        .expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

      expect(createPostResponse.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.any(String),
            field,
          }),
        ])
      );
    }
  );

  it("status 400 - blogId does not exist", async () => {
    const nonExistingBlogId = "507f1f77bcf86cd799439011";

    const result = await request(app)
      .post(routersPaths.posts)
      .set("Authorization", adminToken)
      .send({ ...postDataDto, blogId: nonExistingBlogId })
      .expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

    expect(result.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("Blog is not exist"),
          field: "blogId",
        }),
      ])
    );
  });

  it("status 401 - when no Authorization header", async () => {
    await request(app)
      .post(routersPaths.posts)
      .send(postDataDto)
      .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });
});
