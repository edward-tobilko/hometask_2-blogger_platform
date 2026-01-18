import { Express } from "express";
import request from "supertest";

import { getBlogDtoUtil } from "./get-blog-dto.util";
import { generateBasicAuthToken } from "../generate-admin-auth-token";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { BlogDtoDomain } from "blogs/domain/blog-dto.domain";
import { BlogOutput } from "blogs/application/output/blog-type.output";
import { routersPaths } from "@core/paths/paths";

export async function createBlogUtil(
  app: Express,
  blogInputDto?: Partial<BlogDtoDomain>
): Promise<BlogOutput> {
  const defaultBlogDataDto: BlogDtoDomain = getBlogDtoUtil();
  const blogDataDto = { ...defaultBlogDataDto, ...blogInputDto };

  const createdBlogResponse = await request(app)
    .post(routersPaths.blogs)
    .set("Authorization", generateBasicAuthToken())
    .send(blogDataDto)
    .expect(HTTP_STATUS_CODES.CREATED_201);

  return createdBlogResponse.body;
}
