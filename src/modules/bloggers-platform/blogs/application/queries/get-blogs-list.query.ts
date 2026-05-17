import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { BlogsQueryDto } from '../../api/dto/input-dto/blogs-query.input-dto';
import { BlogListPaginatedViewModel } from '../../api/dto/view-dto/blogs-paginated.view-dto';
import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs.query-repository';

export class GetBlogsListQuery {
  constructor(public queryParam: BlogsQueryDto) {}
}

@QueryHandler(GetBlogsListQuery)
export class GetBlogsListQueryHandler implements IQueryHandler<
  GetBlogsListQuery,
  BlogListPaginatedViewModel
> {
  constructor(private readonly blogsQueryRepo: BlogsQueryRepository) {}

  execute({
    queryParam,
  }: GetBlogsListQuery): Promise<BlogListPaginatedViewModel> {
    return this.blogsQueryRepo.findBlogs(queryParam);
  }
}
