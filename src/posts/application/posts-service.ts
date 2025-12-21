import { PostDomain } from "../domain/post.domain";
import { WithMeta } from "../../core/types/with-meta.type";
import { ApplicationResult } from "../../core/result/application.result";
import { PostsRepository } from "../repositories/posts.repository";
import {
  CreatePostDtoCommand,
  UpdatePostDtoCommand,
} from "./commands/post-dto-type.commands";
import { BlogQueryRepository } from "../../blogs/repositories/blog-query.repository";
import { RepositoryNotFoundError } from "../../core/errors/repository-not-found.error";
import { CreatePostDtoDomain } from "../domain/create-post-dto.domain";
import { PostOutput } from "./output/post-type.output";
import { ApplicationResultStatus } from "../../core/result/types/application-result-status.enum";

class PostsService {
  private postsRepository: PostsRepository;
  private blogQueryRepository: BlogQueryRepository;

  constructor() {
    this.postsRepository = new PostsRepository();
    this.blogQueryRepository = new BlogQueryRepository();
  }

  async createPost(
    command: WithMeta<CreatePostDtoCommand>
  ): Promise<ApplicationResult<PostOutput>> {
    const dto = command.payload;

    const blog = await this.blogQueryRepository.findBlogByIdQueryRepo(
      dto.blogId
    );

    if (!blog) {
      throw new RepositoryNotFoundError("Blog is not exist!", "blogId");
    }

    const domainDto: CreatePostDtoDomain = {
      ...dto,
      blogName: blog.name,
    };

    const newPost = PostDomain.createPost(domainDto);

    const savedPost = await this.postsRepository.createPostRepo(newPost);

    if (!savedPost._id)
      throw new RepositoryNotFoundError(
        `Post was not saved correctly: ${savedPost._id} is missing`
      );

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: {
        id: savedPost._id?.toString(),
        title: savedPost.title,
        shortDescription: savedPost.shortDescription,
        content: savedPost.content,
        blogId: blog.id.toString(),
        blogName: blog.name,
        createdAt: savedPost.createdAt.toISOString(),
      },
      extensions: [],
    });
  }

  async updatePost(
    command: WithMeta<UpdatePostDtoCommand>
  ): Promise<ApplicationResult<null>> {
    const { id, ...updateDto } = command.payload;

    // ищем нужный нам пост
    const existingPost = await this.postsRepository.getPostDomainById(id);

    if (!existingPost) {
      throw new RepositoryNotFoundError("Post does not exist!", "postId");
    }

    if (existingPost.blogId.toString() !== updateDto.blogId) {
      throw new RepositoryNotFoundError(
        "Post does not exist in this blog",
        "postId"
      );
    }

    // обновляем доменную сущность
    existingPost.updatePost(updateDto);

    // сохраняем изменения
    await this.postsRepository.updatePostRepo(existingPost);

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: null,
      extensions: [],
    });
  }

  async deletePost(id: string): Promise<void> {
    return await this.postsRepository.deletePostRepo(id);
  }
}

export const postsService = new PostsService();
