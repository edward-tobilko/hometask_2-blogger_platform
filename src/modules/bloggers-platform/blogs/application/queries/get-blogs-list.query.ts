import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { BlogsQueryDto } from '../../api/dto/input-dto/blogs-query.input-dto';
import { BlogListPaginatedViewModel } from '../../api/dto/view-dto/blogs-paginated.view-dto';
import { BlogsQuerySqlRepository } from '../../infrastructure/sql/repositories/blogs-query-sql.repository';

export class GetBlogsListQuery {
  constructor(
    public queryParam: BlogsQueryDto,
    public userId?: string,
  ) {}
}

@QueryHandler(GetBlogsListQuery)
export class GetBlogsListQueryHandler implements IQueryHandler<
  GetBlogsListQuery,
  BlogListPaginatedViewModel
> {
  constructor(private readonly blogsQueryRepo: BlogsQuerySqlRepository) {}

  execute({
    queryParam,
    userId,
  }: GetBlogsListQuery): Promise<BlogListPaginatedViewModel> {
    return this.blogsQueryRepo.findAll(queryParam, userId);
  }
}
