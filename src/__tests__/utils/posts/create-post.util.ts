import request from "supertest";
import { Express } from "express";

import { POSTS_PATH } from "../../../core/paths/paths";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import {
  PostInputDtoModel,
  PostViewModel,
} from "../../../posts/types/post.types";
import { generateBasicAuthToken } from "../generate-admin-auth-token";
import { getPostDtoUtil } from "./get-post-dto.util";
import { createBlogUtil } from "../blogs/create-blog.util";

export const createPostUtil = async (
  app: Express,
  postInputDto: Partial<PostInputDtoModel>
): Promise<PostViewModel> => {
  const createBlog = await createBlogUtil(app);

  const defaultPostDataDto: PostInputDtoModel = getPostDtoUtil(createBlog.id);
  const postDataDto = { ...defaultPostDataDto, ...postInputDto };

  const createdPostResponse = await request(app)
    .post(POSTS_PATH)
    .set("Authorization", generateBasicAuthToken())
    .send(postDataDto)
    .expect(HTTP_STATUS_CODES.CREATED_201);

  return createdPostResponse.body as PostViewModel;
};
