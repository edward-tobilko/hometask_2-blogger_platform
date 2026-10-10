import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CommentsPaginatedViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comments-paginated.view-dto';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { PostsSqlRepository } from '../../infrastructure/sql/repositories/posts-sql.repository';
import { CommentsSqlQueryRepository } from 'src/modules/bloggers-platform/comments/infrastructure/sql/repositories/comments-sql-query.repo';
import { CommentsQueryDto } from 'src/modules/bloggers-platform/comments/api/dto/input-dto/comments-query.input-dto';

export class GetCommentByPostIdQuery {
  constructor(
    public postId: string,
    public query: CommentsQueryDto,
    public userId?: string,
  ) {}
}

@QueryHandler(GetCommentByPostIdQuery)
export class GetCommentByPostIdQueryHandler implements IQueryHandler<
  GetCommentByPostIdQuery,
  CommentsPaginatedViewModel
> {
  constructor(
    private postsRepo: PostsSqlRepository,
    private commentsQueryRepo: CommentsSqlQueryRepository,
  ) {}

  async execute({
    postId,
    query,
    userId,
  }: GetCommentByPostIdQuery): Promise<CommentsPaginatedViewModel> {
    const postInstance = await this.postsRepo.findById(postId);

    if (!postInstance)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This post with ID:${postId} was not found`,
      });

    return this.commentsQueryRepo.findByPostId(postId, query, userId);
  }
}
