import { Express } from "express";
import request from "supertest";
import { WithId } from "mongodb";

import { BlogInputDto, BlogView } from "../../../blogs/types/blog.types";
import { getBlogDtoUtil } from "./get-blog-dto.util";
import { BLOGS_PATH } from "../../../core/paths/paths";
import { generateBasicAuthToken } from "../generate-admin-auth-token";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";

export async function createBlogUtil(
  app: Express,
  blogInputDto: Partial<BlogInputDto>
): Promise<WithId<BlogView>> {
  const defaultBlogDataDto: BlogInputDto = getBlogDtoUtil();
  const blogDataDto = { ...defaultBlogDataDto, ...blogInputDto };

  const createdBlogResponse = await request(app)
    .post(BLOGS_PATH)
    .set("Authorization", generateBasicAuthToken())
    .send(blogDataDto)
    .expect(HTTP_STATUS_CODES.CREATED_201);

  return createdBlogResponse.body;
}
