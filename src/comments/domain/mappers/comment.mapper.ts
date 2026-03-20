import { Types } from "mongoose";

import { LikeStatus } from "@core/types/like-status.enum";
import { IPostCommentOutput } from "posts/application/output/post-comment.output";
import { PostCommentsLean } from "posts/infrastructure/schemas/post-comments.schema";
import { CommentEntity } from "../entities/comment.entity";

export class CommentMapper {
  // * DB -> Output
  static toViewModel(
    entity: CommentEntity,
    myStatus: LikeStatus
  ): IPostCommentOutput {
    return {
      id: entity.id.toString(),
      content: entity.content,

      commentatorInfo: {
        userId: entity.commentatorInfo.userId.toString(),
        userLogin: entity.commentatorInfo.userLogin,
      },

      createdAt: entity.createdAt.toISOString(), // отдаем ту дату, которая в entity

      likesInfo: {
        likesCount: entity.likesInfo.likesCount,
        dislikesCount: entity.likesInfo.dislikesCount,
        myStatus, // динамический статус
      },
    };
  }

  // * DB -> Domain
  static toDomain(commentDoc: PostCommentsLean): CommentEntity {
    return CommentEntity.reconstitute({
      id: commentDoc._id.toString(),
      content: commentDoc.content,
      postId: commentDoc.postId.toString(),

      commentatorInfo: {
        userId: commentDoc.commentatorInfo.userId.toString(),
        userLogin: commentDoc.commentatorInfo.userLogin,
      },

      createdAt: commentDoc.createdAt,

      likesInfo: {
        likesCount: commentDoc.likesInfo.likesCount,
        dislikesCount: commentDoc.likesInfo.dislikesCount,
      },
    });
  }

  // * Domain -> DB
  static toDb(entity: CommentEntity): PostCommentsLean {
    return {
      _id: new Types.ObjectId(entity.id),
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
