import { inject, injectable } from "inversify";

import { BlogsRepository } from "../repositories/blogs.repository";
import { WithMeta } from "../../core/types/with-meta.type";
import {
  CreateBlogDtoCommand,
  UpdateBlogDtoCommand,
} from "./commands/blog-dto-type.commands";
import { ApplicationResult } from "../../core/result/application.result";
import { BlogDomain } from "../domain/blog.domain";
import { PostDomain } from "../../posts/domain/post.domain";
import { CreatePostDtoDomain } from "../../posts/domain/create-post-dto.domain";
import { PostOutput } from "../../posts/application/output/post-type.output";
import { ApplicationResultStatus } from "../../core/result/types/application-result-status.enum";
import { RepositoryNotFoundError } from "../../core/errors/application.error";
import { CreatePostForBlogDtoCommand } from "../../posts/application/commands/create-post-for-blog-dto.command";
import { IBlogsService } from "blogs/interfaces/IBlogsService";
import { Types } from "@core/di/types";
import { BlogsQueryRepository } from "blogs/repositories/blog-query.repository";

@injectable()
export class BlogsService implements IBlogsService {
  constructor(
    @inject(Types.IBlogsRepository) private blogsRepository: BlogsRepository,
    @inject(Types.IBlogsQueryRepository)
    private blogsQueryRepository: BlogsQueryRepository
  ) {}

  async createBlog(
    command: WithMeta<CreateBlogDtoCommand>
  ): Promise<ApplicationResult<{ id: string } | null>> {
    const newBlog = BlogDomain.createBlog(command.payload);

    const createdBlog = await this.blogsRepository.saveBlog(newBlog);

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: {
        id: createdBlog._id!.toString(),
        name: createdBlog.name,
        description: createdBlog.description,
        websiteUrl: createdBlog.websiteUrl,
        createdAt: createdBlog.createdAt.toISOString(),
        isMembership: createdBlog.isMembership,
      },
      extensions: [],
    });
  }

  async createPostForBlog(
    command: WithMeta<CreatePostForBlogDtoCommand>
  ): Promise<ApplicationResult<PostOutput>> {
    // ищеи блог
    const blog = await this.blogsQueryRepository.findBlogById(
      command.payload.blogId
    );

    if (!blog) {
      throw new RepositoryNotFoundError("Blog is not exist!", "blogId");
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
      await this.blogsRepository.savePostForBlog(newPost);

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
      status: ApplicationResultStatus.Success,
      data: postViewModel,
      extensions: [],
    });
  }

  async updateBlog(
    command: WithMeta<UpdateBlogDtoCommand>
  ): Promise<ApplicationResult<null>> {
    const { id, ...blogDomainDto } = command.payload;

    const blog = await this.blogsRepository.findBlogByIdReconstitute(id);

    blog.updateBlog(blogDomainDto);

    await this.blogsRepository.saveBlog(blog);

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: null,
      extensions: [],
    });
  }

  async deleteBlog(
    command: WithMeta<{ id: string }>
  ): Promise<ApplicationResult<null>> {
    await this.blogsRepository.deleteBlogById(command.payload.id);

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: null,
      extensions: [],
    });
  }
}
