import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Comment, CommentModel } from '../../domain/entities/comment.entity';

@Injectable()
export class CommentsExternalRepository {
  constructor(@InjectModel(Comment.name) private commentModel: CommentModel) {}

  async hideAllByUserId(userId: string): Promise<void> {
    await this.commentModel
      .updateMany(
        { 'commentatorInfo.userId': userId }, // фильтр — все комменты этого юзера
        { $set: { isBanned: true } }, // обновление — ставим флаг
      )
      .exec();
  }

  async showAllByUserId(userId: string): Promise<void> {
    await this.commentModel
      .updateMany(
        { 'commentatorInfo.userId': userId },
        { $set: { isBanned: false } },
      )
      .exec();
  }
}
