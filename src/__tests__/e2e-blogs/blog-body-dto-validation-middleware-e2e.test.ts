import express from "express";
import request from "supertest";

import { setupApp } from "../../app";
import { HTTP_STATUS_CODES } from "../../core/utils/http-statuses.util";
import { BlogInputDtoTypeModel } from "../../types/blog.types";
import { clearDB } from "../utils/clear-db";
import { BLOGS_PATH } from "../../core/paths/paths";
import { generateBasicAuthToken } from "../utils/generate-admin-auth-token";

const adminToken = generateBasicAuthToken();

describe("Create (POST) blogs API body validation ", () => {
  const app = express();
  setupApp(app);

  const testValidDtoBlog: BlogInputDtoTypeModel = {
    name: "name",
    description: "description",
    websiteUrl: "https://example.com",
  };

  beforeEach(async () => {
    await clearDB(app);
  });

  it("201 - when payload is valid", async () => {
    const createDriverResponse = await request(app)
      .post(BLOGS_PATH)
      .set("Authorization", adminToken)
      .send(testValidDtoBlog)
      .expect(HTTP_STATUS_CODES.CREATED_201);

    expect(createDriverResponse.body).toEqual({
      ...testValidDtoBlog,
      id: expect.any(String),
    });
  });

  it.each([
    {
      name: "name is string",
      payload: { ...testValidDtoBlog, name: 2 },
      field: "name",
    },
    {
      name: "name length > 15",
      payload: { ...testValidDtoBlog, name: "maxLength".repeat(16) },
      field: "name",
    },

    {
      name: "description is string",
      payload: { ...testValidDtoBlog, description: 2 },
      field: "description",
    },
    {
      name: "description length > 500",
      payload: { ...testValidDtoBlog, description: "maxLength".repeat(501) },
      field: "description",
    },

    {
      name: "website url is too long",
      payload: {
        ...testValidDtoBlog,
        websiteUrl: "https://site.com/" + "blogggggggs".repeat(90),
      },
      field: "websiteUrl",
    },
    {
      name: "website url is invalid (no https)",
      payload: { ...testValidDtoBlog, websiteUrl: "http://site.com" },
      field: "websiteUrl",
    },
    {
      name: "website url is invalid (random string)",
      payload: { ...testValidDtoBlog, websiteUrl: "not-a-url" },
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

      expect(createBlogResponse.body.errorMessages).toEqual(
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
      .send(testValidDtoBlog)
      .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });
});