import { WithId } from "mongodb";

import { blogsRepository } from "../repositories/blogs.repository";
import { BlogDbDocument, BlogsQueryInput } from "../types/blog.types";

export const blogsService = {
  async findAllBlogs(
    queryDto: BlogsQueryInput
  ): Promise<{ items: WithId<BlogDbDocument>[]; totalCount: number }> {
    return await blogsRepository.findAllBlogsRepo(queryDto);
  },
};
