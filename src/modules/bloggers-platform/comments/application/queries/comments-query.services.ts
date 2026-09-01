import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comment.view-dto';
import { CommentsSqlQueryRepository } from '../../infrastructure/sql/repositories/comments-sql-query.repo';

export class GetCommentByIdQueryHandler {
  constructor(
    public id: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetCommentByIdQueryHandler)
export class GetCommentByIdQuery implements IQueryHandler<
  GetCommentByIdQueryHandler,
  CommentViewModel
> {
  constructor(private readonly commentsQueryRepo: CommentsSqlQueryRepository) {}

  async execute({
    id,
    userId,
  }: GetCommentByIdQueryHandler): Promise<CommentViewModel> {
    const existingComment = await this.commentsQueryRepo.findById(id, userId);

    if (!existingComment)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This comment with ID:${id} was not found`,
      });

    return existingComment;
  }
}
