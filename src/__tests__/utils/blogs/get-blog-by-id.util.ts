import request from "supertest";
import { Express } from "express";

import { BLOGS_PATH } from "../../../core/paths/paths";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { BlogView } from "../../../blogs/types/blog.types";

export async function getBlogByIdUtil(
  app: Express,
  blogId: string
): Promise<BlogView> {
  const blogByIdResponse = await request(app)
    .get(`${BLOGS_PATH}/${blogId}`)
    .expect(HTTP_STATUS_CODES.OK_200);

  return blogByIdResponse.body;
}
