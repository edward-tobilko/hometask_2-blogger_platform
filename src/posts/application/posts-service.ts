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

class PostsService {
  private postsRepository: PostsRepository;
  private blogQueryRepository: BlogQueryRepository;

  constructor() {
    this.postsRepository = new PostsRepository();
    this.blogQueryRepository = new BlogQueryRepository();
  }

  async createPost(
    command: WithMeta<CreatePostDtoCommand>
  ): Promise<ApplicationResult<{ id: string } | null>> {
    const dto = command.payload;

    const blog = await this.blogQueryRepository.findBlogByIdQueryRepo(
      dto.blogId
    );

    if (!blog) {
      throw new RepositoryNotFoundError("Blog is not exist!");
    }

    const domainDto: CreatePostDtoDomain = {
      ...dto,
    };

    const newPost = PostDomain.createPost(domainDto);

    const savedPost = await this.postsRepository.createPostRepo(newPost);

    return new ApplicationResult({ data: { id: savedPost._id!.toString() } });
  }

  async updatePost(
    command: WithMeta<UpdatePostDtoCommand>
  ): Promise<ApplicationResult<null>> {
    const { id, ...updateDto } = command.payload;

    // ищем нужный нам пост
    const existingPost = await this.postsRepository.getPostDomainById(id);

    if (!existingPost) {
      throw new RepositoryNotFoundError("Post does not exist!");
    }

    // обновляем доменную сущность
    existingPost.updatePost(updateDto);

    // сохраняем изменения
    await this.postsRepository.updatePostRepo(existingPost);

    return new ApplicationResult({ data: null });
  }

  async deletePost(id: string): Promise<void> {
    return await this.postsRepository.deletePostRepo(id);
  }
}

export const postsService = new PostsService();
