import { Express } from "express";
import request from "supertest";

import { generateBasicAuthToken } from "../generate-admin-auth-token";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { getPostsForBlogDtoUtil } from "./get-posts-for-blog-dto.util";
import { PostOutput } from "posts/application/output/post-type.output";
import { CreatePostForBlogRP } from "posts/routes/request-payload-types/create-post-for-blog.request-payload-types";
import { routersPaths } from "@core/paths/paths";

export async function createPostForBlogUtil(
  app: Express,
  blogId: string
): Promise<PostOutput> {
  const defaultPostForBlogDataDto: CreatePostForBlogRP =
    getPostsForBlogDtoUtil();

  const createdPostForBlog = await request(app)
    .post(`${routersPaths.blogs}/${blogId}/posts`)
    .set("Authorization", generateBasicAuthToken())
    .send(defaultPostForBlogDataDto)
    .expect(HTTP_STATUS_CODES.CREATED_201);

  return createdPostForBlog.body;
}
