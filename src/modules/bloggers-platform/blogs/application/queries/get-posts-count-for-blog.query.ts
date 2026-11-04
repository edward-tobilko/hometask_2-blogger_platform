import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { BlogsQuerySqlRepository } from '../../infrastructure/sql/repositories/blogs-query-sql.repository';
import { PostsQuerySqlRepository } from 'src/modules/bloggers-platform/posts/infrastructure/sql/repositories/posts-query-sql.repository';

export class GetPostsCountForBlogQuery extends Query<number> {
  constructor(public blogId: string) {
    super();
  }
}

@QueryHandler(GetPostsCountForBlogQuery)
export class GetPostsCountForBlogHandler implements IQueryHandler<
  GetPostsCountForBlogQuery,
  number
> {
  constructor(
    private blogsQueryRepo: BlogsQuerySqlRepository,
    private postsQueryRepo: PostsQuerySqlRepository,
  ) {}

  async execute({ blogId }: GetPostsCountForBlogQuery): Promise<number> {
    if (!(await this.blogsQueryRepo.existsById(blogId))) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${blogId} was not found`,
      });
    }

    return this.postsQueryRepo.countByBlogId(blogId);
  }
}
