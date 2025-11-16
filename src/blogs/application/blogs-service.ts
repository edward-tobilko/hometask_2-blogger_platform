import { ObjectId, WithId } from "mongodb";

import { blogsRepository } from "../repositories/blogs.repository";
import { BlogQueryParamInput } from "../types/blog.types";
import {
  PostDbDocument,
  PostInputDtoModel,
  PostViewModel,
} from "../../posts/types/post.types";
import { mapToPostForBlogOutputUtil } from "./mappers/map-to-post-for-blog-output.util";

export const blogsService = {
  async findAllBlogs(
    queryDto: BlogQueryParamInput
  ): Promise<{ items: WithId<BlogDbDocument>[]; totalCount: number }> {
    return await blogsRepository.findAllBlogsRepo(queryDto);
  },

  async findBlogById(blogId: string): Promise<WithId<BlogDbDocument>> {
    return await blogsRepository.findBlogByIdRepo(blogId);
  },

  async createBlog(dto: BlogInputDtoModel): Promise<WithId<BlogDbDocument>> {
    return await blogsRepository.createBlogRepo(dto);
  },

  async createPostForBlog(
    blogId: string,
    dto: PostInputDtoModel
  ): Promise<PostViewModel> {
    const blog = await blogsRepository.findBlogByIdRepo(blogId);

    const newPostForBlog: PostDbDocument = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog._id,
      blogName: blog.name,
      createdAt: new Date(),
    };

    const createdPostForBlog =
      await blogsRepository.createPostForBlogRepo(newPostForBlog);

    const mappedPostForBlogOutput =
      mapToPostForBlogOutputUtil(createdPostForBlog);

    return mappedPostForBlogOutput;
  },

  async getAllPostsForBlog(
    queryDto: BlogQueryParamInput
  ): Promise<{ postsForBlog: WithId<PostDbDocument>[]; totalCount: number }> {
    return await blogsRepository.getAllPostsForBlogRepo(queryDto);
  },

  async updateBlog(id: string, dto: BlogInputDtoModel): Promise<void> {
    return await blogsRepository.updateBlogRepo(id, dto);
  },

  async deleteBlog(id: string): Promise<void> {
    const deleteResult = await blogsRepository.deleteBlogRepo(id);

    return deleteResult;
  },
};
