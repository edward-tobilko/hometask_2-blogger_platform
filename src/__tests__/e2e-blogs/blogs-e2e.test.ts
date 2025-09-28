import express from "express";
import request from "supertest";
import { log } from "node:console";

import { setupApp } from "../../app";
import { HTTP_STATUS_CODES } from "../../core/utils/http-statuses.util";
import { BlogInputDtoTypeModel, BlogTypeModel } from "../../types/blog.types";
import { BLOGS_PATH, TESTING_PATH } from "../../core/paths/paths";
import { clearDB } from "../utils/clear-db";
import { generateBasicAuthToken } from "../utils/generate-admin-auth-token";

const adminToken = generateBasicAuthToken();

describe("E2E Blogs API tests", () => {
  const app = express();
  setupApp(app);

  const testValidDtoBlog: BlogInputDtoTypeModel = {
    name: "name",
    description: "description",
    websiteUrl: "https://example.com",
  };

  let name1 = "new name-1";
  let name2 = "new name-2";
  let description1 = "new description-1";
  let description2 = "new description-2";

  // * Helper func
  const createBlogResponse = async (name: string, description: string) => {
    const response = await request(app)
      .post(BLOGS_PATH)
      .set("Authorization", adminToken)
      .send({
        ...testValidDtoBlog,
        name: name,
        description: description,
      })
      .expect(HTTP_STATUS_CODES.CREATED_201);

    return response.body as BlogTypeModel;
  };

  beforeEach(async () => {
    await request(app)
      .delete(TESTING_PATH)
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);
  });

  it("GET: /blogs -> should return blogs list - 200", async () => {
    await createBlogResponse(name1, description1);
    await createBlogResponse(name2, description2);

    const blogListResponse = await request(app)
      .get(BLOGS_PATH)
      .expect(HTTP_STATUS_CODES.OK_200);

    expect(Array.isArray(blogListResponse.body)).toBe(true);
    expect(blogListResponse.body.length).toBeGreaterThanOrEqual(2);
  });

  it("POST: /blogs -> should create new blog - 201", async () => {
    await createBlogResponse(name1, description1);
  });

  it("GET: /blogs/:id -> should return one blog by id - 200", async () => {
    const getCreatedBlogResponse = await createBlogResponse(
      name1,
      description1
    );

    const blogResponse = await request(app)
      .get(`${BLOGS_PATH}/${getCreatedBlogResponse.id}`)
      .expect(HTTP_STATUS_CODES.OK_200);

    expect(blogResponse.body).toEqual(getCreatedBlogResponse);
  });

  it("GET: /blogs/:id -> should NOT return blog by id (If blog for passed id does not exist) - 404", async () => {
    await request(app).get(`/99999`).expect(HTTP_STATUS_CODES.NOT_FOUND_404);

    await request(app).get(`/abc`).expect(HTTP_STATUS_CODES.NOT_FOUND_404);
  });

  it("PUT: /blogs/:id -> should update blog by id - 204", async () => {
    const getResponseCreatedBlogResult = await createBlogResponse(
      name1,
      description1
    );

    const updatedDtoBlog = {
      ...testValidDtoBlog,
      name: "updated name",
    };

    await request(app)
      .put(`${BLOGS_PATH}/${getResponseCreatedBlogResult.id}`)
      .set("Authorization", adminToken)
      .send(updatedDtoBlog)
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    const getResponseUpdatedBlogResult = await request(app)
      .get(`${BLOGS_PATH}/${getResponseCreatedBlogResult.id}`)
      .expect(HTTP_STATUS_CODES.OK_200);

    expect(getResponseUpdatedBlogResult.body).toEqual({
      ...updatedDtoBlog,
      id: getResponseCreatedBlogResult.id,
    });
  });

  it("DELETE: /blogs/:id -> should remove blog by id and check after NOT FOUND", async () => {
    const getResponseCreatedBlogResult = await createBlogResponse(
      name1,
      description1
    );

    await request(app)
      .delete(`${BLOGS_PATH}/${getResponseCreatedBlogResult.id}`)
      .set("Authorization", adminToken)
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    const getResponseDeletedBlogResult = await request(app).get(
      `${BLOGS_PATH}/${getResponseCreatedBlogResult.id}`
    );

    expect(getResponseDeletedBlogResult.status).toBe(
      HTTP_STATUS_CODES.NOT_FOUND_404
    );
  });

  afterEach(async () => {
    await clearDB(app);
  });
});
