import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import {
  Comment,
  CommentDocument,
  CommentLean,
  CommentModel,
} from '../../domain/entities/comment.entity';
import { LikeStatus } from 'src/core/enums/like-status.enum';

@Injectable()
export class CommentsRepository {
  constructor(@InjectModel(Comment.name) private commentModel: CommentModel) {}

  async findById(commentId: string): Promise<CommentDocument | null> {
    return this.commentModel.findById(commentId).exec();
  }

  async findUserCurrentLikeStatus(
    userId: string,
    commentId: string,
  ): Promise<LikeStatus | null> {
    const commentInstance = await this.commentModel
      .findById(commentId)
      .lean<CommentLean>()
      .exec();

    const userLikeStatus =
      commentInstance?.likesInfo.userReactions.find(
        (reaction) => reaction.userId === userId,
      )?.status ?? LikeStatus.None;

    return userLikeStatus;
  }

  async save(commentInstance: CommentDocument): Promise<void> {
    await commentInstance.save();
  }

  async create(
    postId: string,
    content: string,
    userId: string,
    userLogin: string,
  ): Promise<CommentDocument> {
    const commentDoc = await this.commentModel.create({
      content,
      postId: new Types.ObjectId(postId),
      commentatorInfo: { userId, userLogin },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        userReactions: [],
      },
    });

    return commentDoc;
  }

  async setLikeStatusForComment(
    commentId: string,
    userId: string,
    likeStatus: LikeStatus,
    likes: number,
    disLikes: number,
  ): Promise<void> {
    // * Удалить старую реакцию и обновить счётчики
    await this.commentModel
      .updateOne(
        {
          _id: new Types.ObjectId(commentId),
        },
        {
          $inc: {
            'likesInfo.likesCount': likes,
            'likesInfo.dislikesCount': disLikes,
          },

          $pull: {
            'likesInfo.userReactions': { userId },
          },
        },
      )
      .exec();

    // * Добавить новую реакцию (только если статус не None)
    if (likeStatus !== LikeStatus.None) {
      await this.commentModel
        .updateOne(
          {
            _id: new Types.ObjectId(commentId),
          },
          {
            $push: {
              'likesInfo.userReactions': { userId, status: likeStatus },
            },
          },
        )
        .exec();
    }
  }

  async delete(commentId: string): Promise<void> {
    await this.commentModel.findByIdAndDelete(commentId);
  }
}
