import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CommentsPaginatedViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comments-paginated.view-dto';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CommentsSqlQueryRepository } from 'src/modules/bloggers-platform/comments/infrastructure/sql/repositories/comments-sql-query.repo';
import { CommentsQueryDto } from 'src/modules/bloggers-platform/comments/api/dto/input-dto/comments-query.input-dto';
import { PostsQuerySqlRepository } from '../../infrastructure/sql/repositories/posts-query-sql.repository';

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
    private postsQueryRepo: PostsQuerySqlRepository,
    private commentsQueryRepo: CommentsSqlQueryRepository,
  ) {}

  async execute({
    postId,
    query,
    userId,
  }: GetCommentByPostIdQuery): Promise<CommentsPaginatedViewModel> {
    const isPostExists = await this.postsQueryRepo.existById(postId);

    if (!isPostExists)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This post with ID:${postId} was not found`,
      });

    return this.commentsQueryRepo.findByPostId(postId, query, userId);
  }
}
