import { ObjectId, WithId } from "mongodb";

import {
  PostDbDocument,
  PostInputDtoModel,
  PostViewModel,
} from "../../posts/types/post.types";

export class BlogsService {
  // async findBlogById(blogId: string): Promise<WithId<BlogDbDocument>> {
  //   return await blogsRepository.findBlogByIdRepo(blogId);
  // }
  // async createBlog(dto: BlogInputDtoModel): Promise<WithId<BlogDbDocument>> {
  //   return await blogsRepository.createBlogRepo(dto);
  // }
  // async createPostForBlog(
  //   blogId: string,
  //   dto: PostInputDtoModel
  // ): Promise<PostViewModel> {
  //   const blog = await blogsRepository.findBlogByIdRepo(blogId);
  //   const newPostForBlog: PostDbDocument = {
  //     title: dto.title,
  //     shortDescription: dto.shortDescription,
  //     content: dto.content,
  //     blogId: blog._id,
  //     blogName: blog.name,
  //     createdAt: new Date(),
  //   };
  //   const createdPostForBlog =
  //     await blogsRepository.createPostForBlogRepo(newPostForBlog);
  //   const mappedPostForBlogOutput =
  //     mapToPostForBlogOutputUtil(createdPostForBlog);
  //   return mappedPostForBlogOutput;
  // }
  // async getAllPostsForBlog(
  //   queryDto: BlogQueryParamInput
  // ): Promise<{ postsForBlog: WithId<PostDbDocument>[]; totalCount: number }> {
  //   return await blogsRepository.getAllPostsForBlogRepo(queryDto);
  // }
  // async updateBlog(id: string, dto: BlogInputDtoModel): Promise<void> {
  //   return await blogsRepository.updateBlogRepo(id, dto);
  // }
  // async deleteBlog(id: string): Promise<void> {
  //   const deleteResult = await blogsRepository.deleteBlogRepo(id);
  //   return deleteResult;
  // }
}
