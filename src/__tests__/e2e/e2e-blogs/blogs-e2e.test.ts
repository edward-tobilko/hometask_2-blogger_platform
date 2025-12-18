import express from "express";
import request from "supertest";

import { setupApp } from "../../../app";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { clearDB } from "../../utils/clear-db";
// import { generateBasicAuthToken } from "../../utils/generate-admin-auth-token";
import { createBlogUtil } from "../../utils/blogs/create-blog.util";
import { runDB, stopDB } from "../../../db/mongo.db";
import { SETTINGS_MONGO_DB } from "../../../core/settings/setting-mongo.db";
// import { getBlogDtoUtil } from "../../utils/blogs/get-blog-dto.util";
// import { getBlogByIdUtil } from "../../utils/blogs/get-blog-by-id.util";
// import { getPostsForBlogDtoUtil } from "../../utils/blogs/get-posts-for-blog-dto.util";
// import { createPostForBlogUtil } from "../../utils/blogs/create-post-for-blog.util";
// import { BlogDtoDomain } from "../../../blogs/domain/blog-dto.domain";
// import { CreatePostForBlogRequestPayload } from "../../../posts/routes/request-payloads/create-post-for-blog.request-payload";
import { routersPaths } from "../../../core/paths/paths";

// const adminToken = generateBasicAuthToken();

describe("E2E Blogs API tests", () => {
  const app = express();
  setupApp(app);

  // const testBlogDataDto: BlogDtoDomain = getBlogDtoUtil();
  // const testPostsForBlogDataDto: CreatePostForBlogRequestPayload =
  //   getPostsForBlogDtoUtil();

  beforeAll(async () => {
    await runDB(SETTINGS_MONGO_DB.MONGO_URL);
    await clearDB(app);
  });

  afterAll(async () => {
    await stopDB();
  });

  it("GET: /api/blogs -> should return blogs list - 200", async () => {
    await Promise.all([
      createBlogUtil(app, {
        name: "test name-1",
        description: "test desc-1",
      }),
      createBlogUtil(app, {
        name: "test name-1",
        description: "test desc-1",
      }),
    ]);

    const blogListResponse = await request(app)
      .get(
        `${routersPaths.blogs}?pageSize=5&pageNumber=1&sortBy=createdAt&sortDirection=desc&searchNameTerm=a`
      )
      .expect(HTTP_STATUS_CODES.OK_200);

    expect(Array.isArray(blogListResponse.body.items)).toBe(true);
    expect(blogListResponse.body.items.length).toBeGreaterThanOrEqual(2);
  });

  // it("POST: /api/blogs -> should create new blog - 201", async () => {
  //   const createdBlogResponse = await createBlogUtil(app, testBlogDataDto);

  //   expect(createdBlogResponse).toEqual(
  //     expect.objectContaining(testBlogDataDto)
  //   );
  // });

  // it("GET: /api/blogs/:id/posts -> should return posts list for blog - 200", async () => {
  //   const createdBlog = await createBlogUtil(app, testBlogDataDto);

  //   await Promise.all([
  //     await createPostForBlogUtil(app, createdBlog.id),
  //     await createPostForBlogUtil(app, createdBlog.id),
  //   ]);

  //   const postListForBlogResponse = await request(app)
  //     .get(`${routersPaths.blogs}/${createdBlog.id}/posts`)
  //     .expect(HTTP_STATUS_CODES.OK_200);

  //   expect(Array.isArray(postListForBlogResponse.body.items)).toBe(true);
  //   expect(postListForBlogResponse.body.items.length).toBeGreaterThanOrEqual(2);
  // });

  // it("POST: /api/blogs/:id/posts -> should create post for blog - 201", async () => {
  //   const createdBlog = await createBlogUtil(app, testBlogDataDto);
  //   const createdPostForBlog = await createPostForBlogUtil(app, createdBlog.id);

  //   expect(createdPostForBlog).toEqual(
  //     expect.objectContaining({
  //       id: expect.any(String),
  //       title: testPostsForBlogDataDto.title,
  //       shortDescription: testPostsForBlogDataDto.shortDescription,
  //       content: testPostsForBlogDataDto.content,
  //       blogId: createdBlog.id,
  //       blogName: createdBlog.name,
  //       createdAt: expect.any(String),
  //     })
  //   );
  // });

  // it("GET: /api/blogs/:id -> should return one blog by id - 200", async () => {
  //   const createdBlogResponse = await createBlogUtil(app, testBlogDataDto);

  //   const getBlogByIdResponse = await getBlogByIdUtil(
  //     app,
  //     createdBlogResponse.id
  //   );

  //   expect(getBlogByIdResponse).toEqual(
  //     expect.objectContaining(createdBlogResponse)
  //   );
  // });

  // it("GET: /blogs/:id -> should NOT return blog by id (If blog for passed id does not exist) - 404", async () => {
  //   await request(app)
  //     .get(`${routersPaths.blogs}/507f1f77bcf86cd799439011`)
  //     .expect(HTTP_STATUS_CODES.NOT_FOUND_404);

  //   await request(app)
  //     .get(`${routersPaths.blogs}/507f1f77bcf86cd799439011`)
  //     .expect(HTTP_STATUS_CODES.NOT_FOUND_404);
  // });

  // it("PUT: /blogs/:id -> should update blog by id - 204", async () => {
  //   const createdBlogResponse = await createBlogUtil(app, testBlogDataDto);

  //   const updatedDtoBlog = {
  //     ...testBlogDataDto,
  //     name: "updated name",
  //   };

  //   await request(app)
  //     .put(`${routersPaths.blogs}/${createdBlogResponse.id}`)
  //     .set("Authorization", adminToken)
  //     .send(updatedDtoBlog)
  //     .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

  //   const updatedBlogResponse = await getBlogByIdUtil(
  //     app,
  //     createdBlogResponse.id
  //   );

  //   expect(updatedBlogResponse).toEqual({
  //     ...updatedDtoBlog,
  //     id: createdBlogResponse.id,
  //     createdAt: expect.any(String),
  //     isMembership: false,
  //   });
  // });

  // it("DELETE: /blogs/:id -> should remove blog by id and check after NOT FOUND - 204", async () => {
  //   const createdBlogResponse = await createBlogUtil(app, testBlogDataDto);

  //   expect(typeof createdBlogResponse.id).toBe("string");

  //   await request(app)
  //     .delete(`${routersPaths.blogs}/${createdBlogResponse.id}`)
  //     .set("Authorization", adminToken)
  //     .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

  //   await request(app)
  //     .get(`${routersPaths.blogs}/${createdBlogResponse.id}`)
  //     .expect(HTTP_STATUS_CODES.NOT_FOUND_404);
  // });
});

// ? toMatchObject -  allows you to check only essential fields without requiring a 100% match of objects.
