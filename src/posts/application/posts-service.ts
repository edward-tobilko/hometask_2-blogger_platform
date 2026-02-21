import { inject, injectable } from "inversify";
import { Types as MongooseTypes } from "mongoose";

import { WithMeta } from "../../core/types/with-meta.type";
import { ApplicationResult } from "../../core/result/application.result";
import { PostOutput } from "./output/post-type.output";
import { ApplicationResultStatus } from "../../core/result/types/application-result-status.enum";
import {
  ApplicationError,
  NotFoundError,
  RepositoryNotFoundError,
} from "../../core/errors/application.error";
import { CreatePostDtoCommand } from "./commands/create-post-dto.command";
import { UpdatePostDtoCommand } from "./commands/update-post-dto.command";
import { CreateCommentForPostDtoCommand } from "./commands/create-comment-for-post-dto.command";
import { IPostCommentOutput } from "./output/post-comment.output";
import { IPostsService } from "posts/interfaces/IPostsService";
import { Types } from "@core/di/types";
import { IPostsRepository } from "posts/interfaces/IPostsRepository";
import { IBlogsQueryRepository } from "blogs/interfaces/IBlogsQueryRepository";
import { IPostsQueryRepository } from "posts/interfaces/IPostsQueryRepository";
import { LikeStatus } from "@core/types/like-status.enum";

@injectable()
export class PostsService implements IPostsService {
  constructor(
    @inject(Types.IPostsRepository) private postsRepository: IPostsRepository,
    @inject(Types.IBlogsQueryRepository)
    private blogsQueryRepository: IBlogsQueryRepository,
    @inject(Types.IPostsQueryRepository)
    private postsQueryRepository: IPostsQueryRepository
  ) {}

  // * CREATE
  async createPost(
    command: WithMeta<CreatePostDtoCommand>
  ): Promise<ApplicationResult<PostOutput>> {
    const dto = command.payload;

    const blog = await this.blogsQueryRepository.findBlogById(dto.blogId);

    if (!blog) {
      throw new RepositoryNotFoundError("Blog is not exist!", "blogId");
    }

    // const domainDto: CreatePostDtoDomain = {
    //   ...dto,
    //   blogId: dto.blogId.toString(),
    //   blogName: blog.name,
    // };

    // const newPost = PostDomain.createPost(domainDto);

    const savedPost = await this.postsRepository.createPost({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: new MongooseTypes.ObjectId(dto.blogId),
      blogName: blog.name,
    });

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
        // createdAt: savedPost.createdAt.toISOString(),
      },

      extensions: [],
    });
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

    // const newPostComment = PostCommentDomain.createCommentForPost({
    //   postId: new MongooseTypes.ObjectId(postId),
    //   content,

    //   commentatorInfo: {
    //     userId: new MongooseTypes.ObjectId(userId),
    //     userLogin,
    //   },
    // });

    const createdComment = await this.postsRepository.createPostComment({
      content,
      postId: new MongooseTypes.ObjectId(postId),

      commentatorInfo: {
        userId: new MongooseTypes.ObjectId(commentatorInfo.userId),
        userLogin: commentatorInfo.userLogin,
      },

      // * likesInfo не передаем — schema поставит default
    });

    if (!createdComment) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new NotFoundError("comment is not found", "commentId")],
      });
    }

    if (!createdComment._id)
      throw new RepositoryNotFoundError(
        `Comment was not saved correctly: ${createdComment._id} is missing`
      );

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,

      data: {
        id: createdComment._id!.toString(),
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

        // createdAt: newPostComment.createdAt.toISOString(),
      },

      extensions: [],
    });
  }

  // * UPDATE
  async updatePost(
    command: WithMeta<UpdatePostDtoCommand>
  ): Promise<ApplicationResult<null>> {
    // const existingPost = await this.postsRepository.getPostDomainById(id);

    // if (!existingPost) {
    //   return new ApplicationResult({
    //     status: ApplicationResultStatus.NotFound,
    //     data: null,
    //     extensions: [new ApplicationError("Post does not exist!", "postId")],
    //   });
    // }

    // if (existingPost.blogId.toString() !== updateDto.blogId) {
    //   return new ApplicationResult({
    //     status: ApplicationResultStatus.NotFound,
    //     data: null,
    //     extensions: [
    //       new ApplicationError("Post does not exist in this blog!", "postId"),
    //     ],
    //   });
    // }

    // * обновляем доменную сущность
    // existingPost.updatePost(updateDto);

    // * сохраняем изменения
    const updatedPost = await this.postsRepository.updatePost(command.payload);

    if (!updatedPost) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new ApplicationError("Post is not found", "postId")],
      });
    }

    if (updatedPost === "BLOG_MISMATCH") {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [
          new ApplicationError("Post does not belong to this blog", "blogId"),
        ],
      });
    }

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: null,
      extensions: [],
    });
  }

  // * DELETE
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
}
