import { ObjectId, WithId } from "mongodb";

import { BlogsRepository } from "../repositories/blogs.repository";
import { WithMeta } from "../../core/types/with-meta.type";
import { CreateBlogDtoCommand } from "./commands/blog-dto-type.commands";
import { ApplicationResult } from "../../core/result/application.result";
import { BlogDomain } from "../domain/blog.domain";

export class BlogsService {
  private blogsRepository: BlogsRepository;

  constructor() {
    this.blogsRepository = new BlogsRepository();
  }

  // async findBlogById(blogId: string): Promise<WithId<BlogDbDocument>> {
  //   return await blogsRepository.findBlogByIdRepo(blogId);
  // }

  async createBlog(
    command: WithMeta<CreateBlogDtoCommand>
  ): Promise<ApplicationResult<{ id: string } | null>> {
    const newBlog = BlogDomain.createBlog(command.payload);

    const createdBlog = await this.blogsRepository.saveBlogRepo(newBlog);

    return new ApplicationResult({
      data: {
        id: createdBlog._id!.toString(),
      },
    });
  }

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

export const blogsService = new BlogsService();
