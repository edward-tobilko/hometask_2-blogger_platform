import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CommentViewModel } from 'src/comments/api/dto/view/comment.view';
import {
  Comment,
  CommentLean,
  CommentModel,
} from 'src/comments/domain/entities/comment.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: CommentModel,
  ) {}

  async findCommentById(id: string): Promise<CommentViewModel | null> {
    const comment = await this.commentModel
      .findById(id)
      .lean<CommentLean>()
      .exec();

    if (!comment) return null;

    return CommentViewModel.mapToViewModel(comment);
  }
}
