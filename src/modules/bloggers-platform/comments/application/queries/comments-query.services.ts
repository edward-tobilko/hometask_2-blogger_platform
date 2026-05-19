import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comment.view-dto';
import { CommentsQueryRepository } from 'src/modules/bloggers-platform/comments/infrastructure/repositories/comments-query.repository';

export class GetCommentByIdQueryHandler {
  constructor(public id: string) {}
}

@QueryHandler(GetCommentByIdQueryHandler)
export class GetCommentByIdQuery implements IQueryHandler<
  GetCommentByIdQueryHandler,
  CommentViewModel
> {
  constructor(private readonly commentsQueryRepo: CommentsQueryRepository) {}

  async execute({ id }: GetCommentByIdQueryHandler): Promise<CommentViewModel> {
    const existingComment = await this.commentsQueryRepo.findCommentById(id);

    if (!existingComment)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This comment with ID:${id} was not found`,
      });

    return existingComment;
  }
}
