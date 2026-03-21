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
    commentView: PostCommentsLean,
    myStatus: LikeStatus
  ): IPostCommentOutput {
    return {
      id: commentView._id.toString(),
      content: commentView.content,

      commentatorInfo: {
        userId: commentView.commentatorInfo.userId.toString(),
        userLogin: commentView.commentatorInfo.userLogin,
      },

      createdAt: commentView.createdAt.toISOString(), // отдаем ту дату, которая в entity

      likesInfo: {
        likesCount: commentView.likesInfo.likesCount,
        dislikesCount: commentView.likesInfo.dislikesCount,
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
