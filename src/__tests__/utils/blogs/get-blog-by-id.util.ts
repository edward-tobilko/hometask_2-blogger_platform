import request from "supertest";
import { Express } from "express";

import { BLOGS_PATH } from "../../../core/paths/paths";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { BlogViewModel } from "../../../blogs/types/blog.types";
import { generateBasicAuthToken } from "../generate-admin-auth-token";

export async function getBlogByIdUtil(
  app: Express,
  blogId: string
): Promise<BlogViewModel> {
  const blogByIdResponse = await request(app)
    .get(`${BLOGS_PATH}/${blogId}`)
    .set("Authorization", generateBasicAuthToken())
    .expect(HTTP_STATUS_CODES.OK_200);

  return blogByIdResponse.body;
}
