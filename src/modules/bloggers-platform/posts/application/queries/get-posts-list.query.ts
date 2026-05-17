import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { PostsQueryDto } from '../../api/dto/input-dto/posts-query.input-dto';
import { PostsPaginatedViewModel } from '../../api/dto/view-dto/posts-paginated.view-dto';
import { PostsQueryRepository } from '../../infrastructure/repositories/posts-query.repository';

export class GetPostsListQuery {
  constructor(public queryParam: PostsQueryDto) {}
}

@QueryHandler(GetPostsListQuery)
export class GetPostsListQueryHandler implements IQueryHandler<
  GetPostsListQuery,
  PostsPaginatedViewModel
> {
  constructor(private readonly postsQueryRepo: PostsQueryRepository) {}

  async execute({
    queryParam,
  }: GetPostsListQuery): Promise<PostsPaginatedViewModel> {
    return this.postsQueryRepo.findAllPosts(queryParam);
  }
}
