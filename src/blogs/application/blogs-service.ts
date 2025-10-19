import { WithId } from "mongodb";

import { blogsRepository } from "../repositories/blogs.repository";
import {
  BlogDbDocument,
  BlogInputDtoModel,
  BlogQueryParamInput,
} from "../types/blog.types";

export const blogsService = {
  async findAllBlogs(
    queryDto: BlogQueryParamInput
  ): Promise<{ items: WithId<BlogDbDocument>[]; totalCount: number }> {
    return await blogsRepository.findAllBlogsRepo(queryDto);
  },

  async findBlogById(blogId: string): Promise<WithId<BlogDbDocument>> {
    return await blogsRepository.findBlogByIdRepo(blogId);
  },

  async createNewBlog(dto: BlogInputDtoModel): Promise<WithId<BlogDbDocument>> {
    return await blogsRepository.createNewBlogRepo(dto);
  },
};
