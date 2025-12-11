import request from "supertest";
import { Express } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { BlogDtoDomain } from "../../../blogs/domain/blog-dto.domain";
import { routersPaths } from "../../../core/paths/paths";

export async function getBlogByIdUtil(
  app: Express,
  blogId: string
): Promise<BlogDtoDomain> {
  const blogByIdResponse = await request(app)
    .get(`${routersPaths.blogs}/${blogId}`)
    .expect(HTTP_STATUS_CODES.OK_200);

  return blogByIdResponse.body;
}
