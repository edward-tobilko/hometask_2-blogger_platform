import express from "express";
import request from "supertest";

import { setupApp } from "../../app";
import { HTTP_STATUS_CODES } from "../../core/utils/http-statuses.util";
import { BlogInputDtoTypeModel } from "../../types/blog.types";

const BLOG_URL = "/blogs";
const TESTING_URL = "/testing";

const AUTH = "Basic " + Buffer.from("admin:qwerty").toString("base64");

describe("E2E Blogs API tests", () => {
  const app = express();
  setupApp(app);

  const testValidDtoBlog: BlogInputDtoTypeModel = {
    name: "name",
    description: "description",
    websiteUrl: "https://example.com",
  };

  beforeAll(async () => {
    await request(app)
      .delete(`${TESTING_URL}/all-data`)
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);
  });

  it("GET: /blogs -> should return blogs list", async () => {
    await request(app)
      .post(`${BLOG_URL}`)
      .set("Authorization", AUTH)
      .send({
        ...testValidDtoBlog,
        name: "new name-1",
        description: "new description-1",
      })
      .expect(HTTP_STATUS_CODES.CREATED_201);

    await request(app)
      .post(`${BLOG_URL}`)
      .set("Authorization", AUTH)
      .send({
        ...testValidDtoBlog,
        name: "new name-2",
        description: "new description-2",
      })
      .expect(HTTP_STATUS_CODES.CREATED_201);

    const blogsListResponse = await request(app)
      .get(`${BLOG_URL}`)
      .expect(HTTP_STATUS_CODES.OK_200);

    expect(Array.isArray(blogsListResponse.body)).toBe(true);
    expect(blogsListResponse.body.length).toBeGreaterThanOrEqual(2);
  });

  afterAll(async () => {
    await request(app)
      .delete(`${TESTING_URL}/all-data`)
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);
  });
});
