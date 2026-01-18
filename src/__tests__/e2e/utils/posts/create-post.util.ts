import request from "supertest";
import { Express } from "express";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { generateBasicAuthToken } from "../generate-admin-auth-token";
import { getPostDtoUtil } from "./get-post-dto.util";
import { createBlogUtil } from "../blogs/create-blog.util";
import { routersPaths } from "../../../core/paths/paths";
import { PostOutput } from "../../../posts/application/output/post-type.output";
import { CreatePostRP } from "../../../posts/routes/request-payload-types/create-post.request-payload-types";

export const createPostUtil = async (
  app: Express,
  postInputDto: Partial<CreatePostRP>
): Promise<PostOutput> => {
  const createBlog = await createBlogUtil(app);

  const defaultPostDataDto: CreatePostRP = getPostDtoUtil(createBlog.id);
  const postDataDto = { ...defaultPostDataDto, ...postInputDto };

  const createdPostResponse = await request(app)
    .post(routersPaths.posts)
    .set("Authorization", generateBasicAuthToken())
    .send(postDataDto)
    .expect(HTTP_STATUS_CODES.CREATED_201);

  return createdPostResponse.body as PostOutput;
};
