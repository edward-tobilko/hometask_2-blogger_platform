import { inject, injectable } from "inversify";

import { WithMeta } from "@core/types/with-meta.type";
import {
  CreateBlogDtoCommand,
  UpdateBlogDtoCommand,
} from "../commands/blog-dto-type.commands";
import { ApplicationResult } from "@core/result/application.result";
import { BlogEntity } from "../../domain/entities/blog.entity";
import { PostOutput } from "@posts/application/output/post-type.output";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { ApplicationError } from "@core/errors/application.error";
import { CreatePostForBlogDtoCommand } from "@posts/application/commands/create-post-for-blog-dto.command";
import { IBlogsService } from "@blogs/application/interfaces/blogs-service.interface";
import { DiTypes } from "@core/di/types";
import { IBlogsRepository } from "@blogs/application/interfaces/blogs-repo.interface";
import { BlogOutput } from "../output/blog-type.output";
import { PostEntity } from "@posts/domain/entities/post.entity";
import { LikeStatus } from "@core/types/like-status.enum";
import { BlogMapper } from "@blogs/infrastructure/mappers/blog.mapper";
import { PostMapper } from "@posts/infrastructure/mappers/post.mapper";
import { IPostsRepo } from "@posts/application/interfaces/posts-repo.interface";

@injectable()
export class BlogsService implements IBlogsService {
  constructor(
    @inject(DiTypes.IBlogsRepository) private blogsRepository: IBlogsRepository,
    @inject(DiTypes.IPostsRepository) private postsRepository: IPostsRepo
  ) {}

  async createBlog(
    command: WithMeta<CreateBlogDtoCommand>
  ): Promise<ApplicationResult<BlogOutput | null>> {
    const dto = command.payload;

    const blogInstance = BlogEntity.createBlog(dto);

    const createdBlog = await this.blogsRepository.createBlog(blogInstance);

    const viewModelBlog = BlogMapper.toViewModel(createdBlog);

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: viewModelBlog,
      extensions: [],
    });
  }

  async createPostForBlog(
    command: WithMeta<CreatePostForBlogDtoCommand>
  ): Promise<ApplicationResult<PostOutput | null>> {
    const { blogId, title, shortDescription, content } = command.payload;

    // * find blog
    const blogInstance = await this.blogsRepository.findById(blogId);

    if (!blogInstance) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new ApplicationError("Blog does not exist!", "blogId")],
      });
    }

    // * create domain
    const newPost = PostEntity.createPost({
      title,
      shortDescription,
      content,
      blogId,

      blogName: blogInstance.name,
    });

    // * save
    const createdPostForBlog =
      await this.postsRepository.createAndSavePost(newPost);

    const postViewModel = PostMapper.toViewModel(
      createdPostForBlog,
      LikeStatus.None
    );

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

    // * достаем инстанс блога по id с его методами
    const existingBlog = await this.blogsRepository.findById(dto.id);

    if (!existingBlog) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new ApplicationError("Blog does not exist!", "blogId")],
      });
    }

    // * обновляем доменную сущность
    existingBlog.updateBlog(dto);

    // * сохраняем изменения
    await this.blogsRepository.updateBlog(existingBlog);

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
