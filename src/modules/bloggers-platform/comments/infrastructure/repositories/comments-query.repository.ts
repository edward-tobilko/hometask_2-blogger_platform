import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { LikeStatus } from 'src/core/enums/like-status.enum';

import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comment.view-dto';
import {
  Comment,
  CommentLean,
  CommentModel,
} from 'src/modules/bloggers-platform/comments/domain/entities/comment.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: CommentModel,
  ) {}

  async findCommentById(
    id: string,
    userId?: string,
  ): Promise<CommentViewModel | null> {
    const commentInstance = await this.commentModel
      .findOne({
        _id: new Types.ObjectId(id),
        isBanned: { $ne: true }, // забаненные комментарии не будут попадать ни в items, ни в totalCount
      })
      .lean<CommentLean>()
      .exec();

    if (!commentInstance) return null;

    // * Получаем динамический статус
    const myStatus = userId
      ? (commentInstance.likesInfo.userReactions.find(
          (reaction) => reaction.userId === userId,
        )?.status ?? LikeStatus.None)
      : LikeStatus.None;

    return CommentViewModel.mapToViewModel(commentInstance, myStatus);
  }
}
