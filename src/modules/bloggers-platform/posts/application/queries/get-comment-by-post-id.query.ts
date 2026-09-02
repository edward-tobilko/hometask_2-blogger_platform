import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { PostsQueryDto } from '../../api/dto/input-dto/posts-query.input-dto';
import { CommentsPaginatedViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comments-paginated.view-dto';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { PostsQuerySqlRepository } from '../../infrastructure/sql/repositories/posts-query-sql.repository';
import { PostsSqlRepository } from '../../infrastructure/sql/repositories/posts-sql.repository';

export class GetCommentByPostIdQuery {
  constructor(
    public postId: string,
    public query: PostsQueryDto,
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
    private postsRepo: PostsSqlRepository,
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

    return this.postsQueryRepo.findCommentsByPostId(postId, query, userId);
  }
}
