import { Express } from "express";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { createAuthLogin } from "../auth/auth-login.util";
import { createUserBodyDto } from "../users/create-user.util";
import { getUserDto } from "../users/get-user-dto.util";
import { getBlogDtoUtil } from "../blogs/get-blog-dto.util";
import { createBlogUtil } from "../blogs/create-blog.util";
import { getPostDtoUtil } from "./get-post-dto.util";
import { createPostUtil } from "./create-post.util";

export const setupUserLoginBlogPost = async (app: Express) => {
  // * Создаем user
  const userDto = getUserDto();
  const userRes = await createUserBodyDto(app, userDto);

  // * Входим в систему и получаем accessToken
  const authLoginRes = await createAuthLogin(app, {
    loginOrEmail: userDto.login,
    password: userDto.password,
  }).expect(HTTP_STATUS_CODES.OK_200);

  const accessToken = authLoginRes.body.accessToken;

  // * Создаем blog
  const blogDto = getBlogDtoUtil();
  const blogRes = await createBlogUtil(app, blogDto);

  // * Создаем post (через auth)
  const postDto = getPostDtoUtil(blogRes.id);
  const postRes = await createPostUtil(app, postDto);

  return {
    userDto,
    userRes,
    accessToken,
    blogDto,
    blogRes,
    postDto,
    postRes,
  };
};
