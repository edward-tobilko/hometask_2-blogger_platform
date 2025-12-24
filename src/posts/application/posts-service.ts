import { PostDomain } from "../domain/post.domain";
import { WithMeta } from "../../core/types/with-meta.type";
import { ApplicationResult } from "../../core/result/application.result";
import { PostsRepository } from "../repositories/posts.repository";
import { BlogQueryRepository } from "../../blogs/repositories/blog-query.repository";
import { CreatePostDtoDomain } from "../domain/create-post-dto.domain";
import { PostOutput } from "./output/post-type.output";
import { ApplicationResultStatus } from "../../core/result/types/application-result-status.enum";
import {
  NotFoundError,
  RepositoryNotFoundError,
} from "../../core/errors/application.error";
import { CreatePostDtoCommand } from "./commands/create-post-dto.command";
import { UpdatePostDtoCommand } from "./commands/update-post-dto.command";
import { CreateCommentForPostDtoCommand } from "./commands/create-comment-for-post-dto.command";
import { PostCommentOutput } from "./output/post-comment-type.output";
import { PostQueryRepository } from "../repositories/post-query.repository";
import { PostCommentDomain } from "../domain/post-comment.domain";
import { ObjectId } from "mongodb";

class PostsService {
  private postsRepository: PostsRepository;
  private blogQueryRepository: BlogQueryRepository;
  private postQueryRepository: PostQueryRepository;

  constructor() {
    this.postsRepository = new PostsRepository();
    this.blogQueryRepository = new BlogQueryRepository();
    this.postQueryRepository = new PostQueryRepository();
  }

  // * CREATE
  async createPost(
    command: WithMeta<CreatePostDtoCommand>
  ): Promise<ApplicationResult<PostOutput>> {
    const dto = command.payload;

    const blog = await this.blogQueryRepository.findBlogByIdQueryRepo(
      dto.blogId
    );

    if (!blog) {
      throw new RepositoryNotFoundError("blogId", "Blog is not exist!");
    }

    const domainDto: CreatePostDtoDomain = {
      ...dto,
      blogId: dto.blogId.toString(),
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

  async createPostComment(
    command: WithMeta<CreateCommentForPostDtoCommand>
  ): Promise<ApplicationResult<PostCommentOutput | null>> {
    const { postId, content, userId, userLogin } = command.payload;

    const isPostExists =
      await this.postQueryRepository.getPostByIdQueryRepo(postId);

    if (!isPostExists) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new NotFoundError("postId", "Post is not found!")],
      });
    }

    const newPostComment = PostCommentDomain.createCommentForPost({
      postId: new ObjectId(postId),
      content,

      commentatorInfo: {
        userId: new ObjectId(userId),
        userLogin,
      },
    });

    const insertedId =
      await this.postsRepository.createPostCommentRepo(newPostComment);

    newPostComment._id = insertedId;

    if (!insertedId.id)
      throw new RepositoryNotFoundError(
        `Comment was not saved correctly: ${insertedId.id} is missing`
      );

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,

      data: {
        id: newPostComment._id!.toString(),
        content: newPostComment.content,

        commentatorInfo: {
          userId: newPostComment.commentatorInfo.userId.toString(),
          userLogin: newPostComment.commentatorInfo.userLogin,
        },

        createdAt: newPostComment.createdAt.toISOString(),
      },

      extensions: [],
    });
  }

  // * UPDATE
  async updatePost(
    command: WithMeta<UpdatePostDtoCommand>
  ): Promise<ApplicationResult<null>> {
    const { id, ...updateDto } = command.payload;

    // ищем нужный нам пост
    const existingPost = await this.postsRepository.getPostDomainById(id);

    if (!existingPost) {
      throw new RepositoryNotFoundError("postId", "Post does not exist!");
    }

    if (existingPost.blogId.toString() !== updateDto.blogId) {
      throw new RepositoryNotFoundError(
        "postId",
        "Post does not exist in this blog"
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

  // * DELETE
  async deletePost(id: string): Promise<void> {
    return await this.postsRepository.deletePostRepo(id);
  }
}

export const postsService = new PostsService();
