import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import {
  Comment,
  CommentDocument,
  CommentModel,
} from '../../domain/entities/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(@InjectModel(Comment.name) private commentModel: CommentModel) {}

  async createComment(
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
      },
    });

    return commentDoc;
  }
}
