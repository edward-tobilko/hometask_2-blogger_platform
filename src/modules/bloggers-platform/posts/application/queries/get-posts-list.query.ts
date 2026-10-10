import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { PostsQueryDto } from '../../api/dto/input-dto/posts-query.input-dto';
import { PostsPaginatedViewModel } from '../../api/dto/view-dto/posts-paginated.view-dto';
import { PostsQuerySqlRepository } from '../../infrastructure/sql/repositories/posts-query-sql.repository';

export class GetPostsListQuery {
  constructor(
    public queryParam: PostsQueryDto,
    public userId?: string,
  ) {}
}

@QueryHandler(GetPostsListQuery)
export class GetPostsListQueryHandler implements IQueryHandler<
  GetPostsListQuery,
  PostsPaginatedViewModel
> {
  constructor(private readonly postsQueryRepo: PostsQuerySqlRepository) {}

  async execute({
    queryParam,
    userId,
  }: GetPostsListQuery): Promise<PostsPaginatedViewModel> {
    return this.postsQueryRepo.findAll(queryParam, userId);
  }
}
