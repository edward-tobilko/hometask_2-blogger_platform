import { ObjectId, WithId } from "mongodb";

import { blogsRepository } from "../repositories/blogs.repository";
import {
  BlogDbDocument,
  BlogInputDtoModel,
  BlogQueryParamInput,
} from "../types/blog.types";
import {
  PostDbDocument,
  PostInputDtoModel,
  PostViewModel,
} from "../../posts/types/post.types";
import { mapToPostForBlogOutputUtil } from "../routes/mappers/map-to-post-for-blog-output.util";

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

  async createNewPostForBlog(
    blogId: string,
    dto: PostInputDtoModel
  ): Promise<PostViewModel> {
    const blog = await blogsRepository.findBlogByIdRepo(blogId);

    const newPostByIdBlog: PostDbDocument = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: new ObjectId(dto.blogId),
      blogName: blog.name,
      createdAt: new Date(),
    };

    const createdPostForBlog =
      await blogsRepository.createNewPostForBlogRepo(newPostByIdBlog);

    const mappedPostForBlogOutput =
      mapToPostForBlogOutputUtil(createdPostForBlog);

    return mappedPostForBlogOutput;
  },
};
