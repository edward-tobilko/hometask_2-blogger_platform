import { IUsersQueryService } from "./../../../users/interfaces/IUsersQueryService";
import { inject, injectable } from "inversify";
import mongoose from "mongoose";

import { WithMeta } from "../../../core/types/with-meta.type";
import { ApplicationResult } from "../../../core/result/application.result";
import { ApplicationResultStatus } from "../../../core/result/types/application-result-status.enum";
import {
  ApplicationError,
  InternalServerError,
  NotFoundError,
  RepositoryNotFoundError,
} from "../../../core/errors/application.error";
import { CreatePostDtoCommand } from "../commands/create-post-dto.command";
import { UpdatePostDtoCommand } from "../commands/update-post-dto.command";
import { CreateCommentForPostDtoCommand } from "../commands/create-comment-for-post-dto.command";
import { IPostCommentOutput } from "../output/post-comment.output";
import { IPostsService } from "posts/application/interfaces/posts-service.interface";
import { DiTypes } from "@core/di/types";
import { IPostsRepo } from "posts/application/interfaces/posts-repo.interface";
import { IBlogsQueryRepository } from "blogs/interfaces/IBlogsQueryRepository";
import { LikeStatus } from "@core/types/like-status.enum";
import { IPostsQueryRepo } from "../interfaces/posts-query-repo.interface";
import { PostEntity } from "posts/domain/entities/post.entity";
import { PostCommentEntity } from "posts/domain/entities/post-comment.entity";
import { PostOutput } from "../output/post-type.output";
import { PostMapper } from "posts/domain/mappers/post.mapper";
import { LikeEntity } from "@core/domain/like.domain";

@injectable()
export class PostsService implements IPostsService {
  constructor(
    @inject(DiTypes.IPostsRepository) private postsRepository: IPostsRepo,
    @inject(DiTypes.IBlogsQueryRepository)
    private blogsQueryRepository: IBlogsQueryRepository,
    @inject(DiTypes.IPostsQueryRepository)
    private postsQueryRepository: IPostsQueryRepo,
    @inject(DiTypes.IUsersQueryService)
    private usersQueryService: IUsersQueryService
  ) {}

  async createPost(
    command: WithMeta<CreatePostDtoCommand>
  ): Promise<ApplicationResult<PostOutput | null>> {
    const dto = command.payload;

    const blog = await this.blogsQueryRepository.findBlogById(dto.blogId);

    if (!blog) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new NotFoundError("Blog is not found", "blogId")],
      });
    }

    try {
      const post = PostEntity.createPost({
        title: dto.title,
        shortDescription: dto.shortDescription,
        content: dto.content,
        blogId: dto.blogId,

        blogName: blog.name,
      });

      const savedPost = await this.postsRepository.createPost(post);

      const viewModelPost = PostMapper.toViewModel(savedPost, LikeStatus.None);

      return new ApplicationResult({
        status: ApplicationResultStatus.Success,

        data: viewModelPost,

        extensions: [],
      });
    } catch (error) {
      return new ApplicationResult({
        status: ApplicationResultStatus.BadRequest,
        data: null,
        extensions: [new ApplicationError("Validation error", "post", 400)],
      });
    }
  }

  async createPostComment(
    command: WithMeta<CreateCommentForPostDtoCommand>
  ): Promise<ApplicationResult<IPostCommentOutput | null>> {
    const { postId, content, commentatorInfo } = command.payload;

    const existingPost = await this.postsQueryRepository.getPostById(postId);

    if (!existingPost) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new NotFoundError("Post is not found!", "postId")],
      });
    }

    try {
      const commentPost = PostCommentEntity.createCommentForPost({
        content,
        postId,
        commentatorInfo: {
          userId: commentatorInfo.userId,
          userLogin: commentatorInfo.userLogin,
        },
      });

      const createdComment =
        await this.postsRepository.createPostComment(commentPost);

      if (!createdComment) {
        return new ApplicationResult({
          status: ApplicationResultStatus.NotFound,
          data: null,
          extensions: [
            new NotFoundError("Comment is not found", "commentId", 404),
          ],
        });
      }

      if (!createdComment.id)
        throw new RepositoryNotFoundError(
          `Comment was not saved correctly: ${createdComment.id} is missing`
        );

      return new ApplicationResult({
        status: ApplicationResultStatus.Success,

        data: {
          id: createdComment.id.toString(),
          content,

          commentatorInfo: {
            userId: createdComment.commentatorInfo.userId.toString(),
            userLogin: createdComment.commentatorInfo.userLogin,
          },

          likesInfo: {
            likesCount: createdComment.likesInfo.likesCount,
            dislikesCount: createdComment.likesInfo.dislikesCount,
            myStatus: LikeStatus.None,
          },

          createdAt: createdComment.createdAt!.toISOString(),
        },

        extensions: [],
      });
    } catch (error) {
      return new ApplicationResult({
        status: ApplicationResultStatus.BadRequest,
        data: null,
        extensions: [new ApplicationError("Validation error", "post", 400)],
      });
    }
  }

  async updatePost(
    command: WithMeta<UpdatePostDtoCommand>
  ): Promise<ApplicationResult<null>> {
    const { id, blogId } = command.payload;

    const existingPost = await this.postsQueryRepository.getPostById(id);

    if (!existingPost) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new ApplicationError("Post does not exist!", "postId")],
      });
    }

    if (existingPost.blogId.toString() !== blogId) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [
          new ApplicationError("Post does not exist in this blog!", "postId"),
        ],
      });
    }

    try {
      // * обновляем доменную сущность
      existingPost.updatePost(command.payload);

      // * сохраняем изменения
      const updatedPost = await this.postsRepository.updatePost(existingPost);

      if (!updatedPost) {
        return new ApplicationResult({
          status: ApplicationResultStatus.NotFound,
          data: null,
          extensions: [new ApplicationError("Post is not found", "postId")],
        });
      }

      return new ApplicationResult({
        status: ApplicationResultStatus.Success,
        data: null,
        extensions: [],
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Validation error";
      return new ApplicationResult({
        status: ApplicationResultStatus.BadRequest,
        data: null,
        extensions: [new ApplicationError(message, "post", 400)],
      });
    }
  }

  async deletePost(id: string): Promise<ApplicationResult<null>> {
    const isDeleted = await this.postsRepository.deletePost(id);

    if (!isDeleted) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new ApplicationError("Post is not exist!", "postId")],
      });
    }

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: null,
      extensions: [],
    });
  }

  async upsertPostLike(domain: {
    postId: string;
    userId: string;
    likeStatus: LikeStatus;
  }): Promise<ApplicationResult<null>> {
    const session = await mongoose.startSession(); // * позволяет объединить несколько запросов в одну транзакцию. Без session каждый updateOne() — это отдельная операция.

    try {
      let result: ApplicationResult<null> = new ApplicationResult({
        status: ApplicationResultStatus.InternalServerError,
        data: null,
        extensions: [new InternalServerError("Unknown error")],
      });

      await session.withTransaction(async () => {
        // * Получаем пост (проверяем существование)
        const existingPost = await this.postsQueryRepository.getPostById(
          domain.postId,
          session
        );

        if (!existingPost) {
          result = new ApplicationResult({
            status: ApplicationResultStatus.NotFound,
            data: null,
            extensions: [new NotFoundError("Post is not found", "postId")],
          });

          return;
        }

        // * Получаем предыдущий статус лайка
        const prevLike = await this.postsRepository.findPostLike(
          domain.postId,
          domain.userId,
          session
        );

        const prevStatus = prevLike?.likeStatus || LikeStatus.None;

        // * Если статус не изменился - ничего не делаем
        if (prevStatus === domain.likeStatus) {
          result = new ApplicationResult({
            status: ApplicationResultStatus.NoContent,
            data: null,
            extensions: [],
          });
          return;
        }

        // * Domain: вычисляет изменения счетчиков
        const { likesChange, disLikesChange } = LikeEntity.calculateLikeDislike(
          prevStatus,
          domain.likeStatus
        );

        // * Обновляем счетчики в посте
        await this.postsRepository.updateLikeCounters(
          domain.postId,
          likesChange,
          disLikesChange,
          session
        );

        // * достаём login пользователя (один запрос)
        const user = await this.usersQueryService.getUserById(domain.userId);
        const login = user?.login ?? "";

        // * Сохраняем / обновляем лайк пользователя
        await this.postsRepository.upsertPostLike(
          {
            postId: domain.postId,
            userId: domain.userId,
            likeStatus: domain.likeStatus,
            login,
          },
          session
        );

        // * пересобираем newestLikes и пишем в Post
        const newestLikes = await this.postsQueryRepository.getNewestLikes(
          domain.postId,
          session
        );

        await this.postsRepository.setNewestLikes(
          domain.postId,
          newestLikes,
          session
        );

        result = new ApplicationResult({
          status: ApplicationResultStatus.Success,
          data: null,
          extensions: [],
        });
      });

      return result;
    } catch (error) {
      return new ApplicationResult({
        status: ApplicationResultStatus.InternalServerError,
        data: null,
        extensions: [
          new InternalServerError("Failed to update post like status"),
        ],
      });
    } finally {
      session.endSession();
    }
  }
}
