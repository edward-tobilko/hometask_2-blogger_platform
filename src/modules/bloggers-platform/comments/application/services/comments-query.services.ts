import { Injectable } from '@nestjs/common';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comment.view-dto';
import { CommentsQueryRepository } from 'src/modules/bloggers-platform/comments/infrastructure/repositories/comments-query.repository';

@Injectable()
export class CommentsQueryService {
  constructor(private readonly commentsQueryRepo: CommentsQueryRepository) {}

  async getCommentById(id: string): Promise<CommentViewModel | null> {
    const existingComment = await this.commentsQueryRepo.findCommentById(id);

    if (!existingComment)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This comment with ID:${id} was not found`,
      });

    return existingComment;
  }
}
