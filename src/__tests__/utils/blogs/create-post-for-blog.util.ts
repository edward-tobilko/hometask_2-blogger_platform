import { Express } from "express";
import request from "supertest";

import { BLOGS_PATH } from "../../../core/paths/paths";
import { generateBasicAuthToken } from "../generate-admin-auth-token";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { getPostsForBlogDtoUtil } from "./get-posts-for-blog-dto.util";
import { BlogPostInputDtoModel } from "../../../blogs/types/blog.types";
import { PostViewModel } from "../../../posts/types/post.types";

export async function createPostForBlogUtil(
  app: Express,
  blogId: string
): Promise<PostViewModel> {
  const defaultPostForBlogDataDto: BlogPostInputDtoModel =
    getPostsForBlogDtoUtil();

  const createdPostForBlog = await request(app)
    .post(`${BLOGS_PATH}/${blogId}/posts`)
    .set("Authorization", generateBasicAuthToken())
    .send(defaultPostForBlogDataDto)
    .expect(HTTP_STATUS_CODES.CREATED_201);

  return createdPostForBlog.body;
}
