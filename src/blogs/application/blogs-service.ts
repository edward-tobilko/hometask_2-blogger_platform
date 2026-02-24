import { inject, injectable } from "inversify";
import { Types as MongooseTypes } from "mongoose";

import { WithMeta } from "../../core/types/with-meta.type";
import {
  CreateBlogDtoCommand,
  UpdateBlogDtoCommand,
} from "./commands/blog-dto-type.commands";
import { ApplicationResult } from "../../core/result/application.result";
import { BlogDomain } from "../domain/blog.domain";
// import { PostDomain } from "../../posts/domain/post.domain";
// import { CreatePostDtoDomain } from "../../posts/domain/create-post-dto.domain";
import { PostOutput } from "../../posts/application/output/post-type.output";
import { ApplicationResultStatus } from "../../core/result/types/application-result-status.enum";
import { RepositoryNotFoundError } from "../../core/errors/application.error";
import { CreatePostForBlogDtoCommand } from "../../posts/application/commands/create-post-for-blog-dto.command";
import { IBlogsService } from "blogs/interfaces/IBlogsService";
import { Types } from "@core/di/types";
import { IBlogsRepository } from "blogs/interfaces/IBlogsRepository";
import { IBlogsQueryRepository } from "blogs/interfaces/IBlogsQueryRepository";

@injectable()
export class BlogsService implements IBlogsService {
  constructor(
    @inject(Types.IBlogsRepository) private blogsRepository: IBlogsRepository,
    @inject(Types.IBlogsQueryRepository)
    private blogsQueryRepository: IBlogsQueryRepository
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
    const { blogId, title, shortDescription, content } = command.payload;

    // * find blog
    const blog = await this.blogsQueryRepository.findBlogById(blogId);

    if (!blog) {
      throw new RepositoryNotFoundError("Blog is not exist!", "blogId");
    }

    // * add blogName to domain dto
    // const domainDto: CreatePostDtoDomain = {
    //   ...command.payload,

    //   blogName: blog.name,
    // };

    // * create domain
    // const newPost = PostDomain.createPost(domainDto);

    // * save
    const createdPostForBlog = await this.blogsRepository.savePostForBlog({
      title,
      shortDescription,
      content,

      blogId: new MongooseTypes.ObjectId(blogId),
      blogName: blog.name,
    });

    const postViewModel: PostOutput = {
      id: createdPostForBlog._id.toString(),

      title: createdPostForBlog.title,
      shortDescription: createdPostForBlog.shortDescription,
      content: createdPostForBlog.content,

      blogId: createdPostForBlog.blogId.toString(),
      blogName: createdPostForBlog.blogName,
      createdAt: createdPostForBlog.createdAt!.toISOString(),
    };

    // * return output
    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: postViewModel,
      extensions: [],
    });
  }

  async updateBlog(
    command: WithMeta<UpdateBlogDtoCommand>
  ): Promise<ApplicationResult<null>> {
    const dto = command.payload;

    await this.blogsRepository.updateBlog(dto);

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
