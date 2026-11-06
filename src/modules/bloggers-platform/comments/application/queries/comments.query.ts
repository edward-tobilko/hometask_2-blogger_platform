import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comment.view-dto';
import { CommentsSqlQueryRepository } from '../../infrastructure/sql/repositories/comments-sql-query.repo';

export class GetCommentByIdQuery {
  constructor(
    public id: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdQueryHandler implements IQueryHandler<
  GetCommentByIdQuery,
  CommentViewModel
> {
  constructor(private readonly commentsQueryRepo: CommentsSqlQueryRepository) {}

  async execute({
    id,
    userId,
  }: GetCommentByIdQuery): Promise<CommentViewModel> {
    const existingComment = await this.commentsQueryRepo.findByIdCTE(
      id,
      userId,
    );

    if (!existingComment)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This comment with ID:${id} was not found`,
      });

    return existingComment;
  }
}
