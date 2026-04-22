import { Injectable, NotFoundException } from '@nestjs/common';

import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view/comment.view';
import { CommentsQueryRepository } from 'src/modules/bloggers-platform/comments/infrastructure/repositories/comments-query.repository';

@Injectable()
export class CommentsQueryService {
  constructor(private readonly commentsQueryRepo: CommentsQueryRepository) {}

  async getCommentById(id: string): Promise<CommentViewModel | null> {
    const existingComment = await this.commentsQueryRepo.findCommentById(id);

    if (!existingComment)
      throw new NotFoundException(`This comment with ID:${id} was not found`);

    return existingComment;
  }
}
