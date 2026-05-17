import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { PostsQueryRepository } from '../../infrastructure/repositories/posts-query.repository';
import { PostsQueryDto } from '../../api/dto/input-dto/posts-query.input-dto';
import { CommentsPaginatedViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comments-paginated.view-dto';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

export class GetCommentByPostIdQuery {
  constructor(
    public postId: string,
    public query: PostsQueryDto,
  ) {}
}

@QueryHandler(GetCommentByPostIdQuery)
export class GetCommentByPostIdQueryHandler implements IQueryHandler<
  GetCommentByPostIdQuery,
  CommentsPaginatedViewModel
> {
  constructor(private readonly postsQueryRepo: PostsQueryRepository) {}

  async execute({
    postId,
    query,
  }: GetCommentByPostIdQuery): Promise<CommentsPaginatedViewModel> {
    const post = await this.postsQueryRepo.findPostById(postId);

    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This post with ID:${postId} was not found`,
      });

    return this.postsQueryRepo.findCommentsByPostId(postId, query);
  }
}
