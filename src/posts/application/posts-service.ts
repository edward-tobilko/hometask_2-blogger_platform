import { PostDomain } from "../domain/post.domain";
import { WithMeta } from "../../core/types/with-meta.type";
import { ApplicationResult } from "../../core/result/application.result";
import { PostsRepository } from "../repositories/posts.repository";
import { CreatePostDtoCommand } from "./commands/post-dto-type.commands";
import { BlogQueryRepository } from "../../blogs/repositories/blog-query.repository";
import { RepositoryNotFoundError } from "../../core/errors/repository-not-found.error";
import { ObjectId } from "mongodb";

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
      throw new RepositoryNotFoundError("blog is not exist!");
    }

    const newPost = PostDomain.createPost({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: new ObjectId(dto.blogId),
      blogName: dto,
      createdAt: new Date(),
    });

    const savedPost = await this.postsRepository.savePostRepo(newPost);

    return new ApplicationResult({ data: { id: savedPost._id!.toString() } });
  }

  // async updatePost(
  //   postId: string,
  //   dto: PostInputDtoModel,
  //   blogName: string
  // ): Promise<void> {
  //   return await postsRepository.updatePostRepo(postId, dto, blogName);
  // }
  // async deletePost(id: string): Promise<void> {
  //   return await postsRepository.deletePostRepo(id);
  // }
}

export const postsService = new PostsService();
