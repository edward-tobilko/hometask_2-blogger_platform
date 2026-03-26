import { Types } from "mongoose";

import { LikeStatus } from "@core/types/like-status.enum";
import { IPostCommentOutput } from "posts/application/output/post-comment.output";
import {
  PostCommentsDb,
  PostCommentsLean,
} from "posts/infrastructure/schemas/post-comments.schema";
import { CommentEntity } from "../entities/comment.entity";

export class CommentMapper {
  // * DB -> Output
  static toViewModel(
    commentDomain: PostCommentsLean,
    myStatus: LikeStatus
  ): IPostCommentOutput {
    return {
      id: commentDomain._id.toString(),
      content: commentDomain.content,

      commentatorInfo: {
        userId: commentDomain.commentatorInfo.userId.toString(),
        userLogin: commentDomain.commentatorInfo.userLogin,
      },

      createdAt: commentDomain.createdAt.toISOString(), // отдаем ту дату, которая в entity

      likesInfo: {
        likesCount: commentDomain.likesInfo.likesCount,
        dislikesCount: commentDomain.likesInfo.dislikesCount,
        myStatus, // динамический статус
      },
    };
  }

  // * DB -> Domain
  static toDomain(commentLean: PostCommentsLean): CommentEntity {
    return CommentEntity.reconstitute({
      id: commentLean._id.toString(),
      content: commentLean.content,
      postId: commentLean.postId.toString(),

      commentatorInfo: {
        userId: commentLean.commentatorInfo.userId.toString(),
        userLogin: commentLean.commentatorInfo.userLogin,
      },

      createdAt: commentLean.createdAt,

      likesInfo: {
        likesCount: commentLean.likesInfo.likesCount,
        dislikesCount: commentLean.likesInfo.dislikesCount,
      },
    });
  }

  // * Domain -> DB
  static toDb(entity: CommentEntity): PostCommentsDb {
    return {
      content: entity.content,
      postId: new Types.ObjectId(entity.postId),

      commentatorInfo: {
        userId: new Types.ObjectId(entity.commentatorInfo.userId),
        userLogin: entity.commentatorInfo.userLogin,
      },

      createdAt: entity.createdAt,

      likesInfo: {
        likesCount: entity.likesInfo.likesCount,
        dislikesCount: entity.likesInfo.dislikesCount,
      },
    };
  }
}
