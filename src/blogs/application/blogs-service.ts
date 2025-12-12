import { BlogsRepository } from "../repositories/blogs.repository";
import { WithMeta } from "../../core/types/with-meta.type";
import {
  CreateBlogDtoCommand,
  UpdateBlogDtoCommand,
} from "./commands/blog-dto-type.commands";
import { ApplicationResult } from "../../core/result/application.result";
import { BlogDomain } from "../domain/blog.domain";
import { BlogQueryRepository } from "../repositories/blog-query.repository";
import { PostDomain } from "../../posts/domain/post.domain";
import { RepositoryNotFoundError } from "../../core/errors/repository-not-found.error";
import { CreatePostForBlogDtoCommand } from "../../posts/application/commands/post-dto-type.commands";
import { CreatePostDtoDomain } from "../../posts/domain/create-post-dto.domain";
import { PostOutput } from "../../posts/application/output/post-type.output";

export class BlogsService {
  private blogsRepository: BlogsRepository;
  private blogQueryRepository: BlogQueryRepository;

  constructor() {
    this.blogsRepository = new BlogsRepository();
    this.blogQueryRepository = new BlogQueryRepository();
  }

  async createBlog(
    command: WithMeta<CreateBlogDtoCommand>
  ): Promise<ApplicationResult<{ id: string } | null>> {
    const newBlog = BlogDomain.createBlog(command.payload);

    const createdBlog = await this.blogsRepository.saveBlogRepo(newBlog);

    return new ApplicationResult({
      data: {
        id: createdBlog._id!.toString(),
        name: createdBlog.name,
        description: createdBlog.description,
        websiteUrl: createdBlog.websiteUrl,
        createdAt:
          createdBlog.createdAt instanceof Date
            ? createdBlog.createdAt.toISOString()
            : createdBlog.createdAt,
        isMembership: createdBlog.isMembership,
      },
    });
  }

  async createPostForBlog(
    command: WithMeta<CreatePostForBlogDtoCommand>
  ): Promise<ApplicationResult<PostOutput>> {
    // ищеи блог
    const blog = await this.blogQueryRepository.findBlogByIdQueryRepo(
      command.payload.blogId
    );

    if (!blog) {
      throw new RepositoryNotFoundError("Blog is not exist!");
    }

    // добавляем blogName к доменному dto
    const domainDto: CreatePostDtoDomain = {
      ...command.payload,

      blogName: blog.name,
    };

    // создаем доммен
    const newPost = PostDomain.createPost(domainDto);

    // сохраняем
    const createdPostForBlog =
      await this.blogsRepository.savePostForBlogRepo(newPost);

    const postViewModel: PostOutput = {
      id: createdPostForBlog._id!.toString(),
      title: createdPostForBlog.title,
      shortDescription: createdPostForBlog.shortDescription,
      content: createdPostForBlog.content,
      blogId: createdPostForBlog.blogId.toString(),
      blogName: createdPostForBlog.blogName,
      createdAt: createdPostForBlog.createdAt.toISOString(),
    };

    // возвращаем output
    return new ApplicationResult({
      data: postViewModel,
    });
  }

  async updateBlog(
    command: WithMeta<UpdateBlogDtoCommand>
  ): Promise<ApplicationResult<null>> {
    const { id, ...blogDomainDto } = command.payload;

    const blog = await this.blogsRepository.findBlogByIdReconstituteRepo(id);

    blog.updateBlog(blogDomainDto);

    await this.blogsRepository.saveBlogRepo(blog);

    return new ApplicationResult({ data: null });
  }

  async deleteBlog(
    command: WithMeta<{ id: string }>
  ): Promise<ApplicationResult<null>> {
    await this.blogsRepository.deleteBlogRepo(command.payload.id);

    return new ApplicationResult({ data: null });
  }
}

export const blogsService = new BlogsService();
