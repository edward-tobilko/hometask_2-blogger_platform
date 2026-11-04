import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { BlogsQuerySqlRepository } from '../../infrastructure/sql/repositories/blogs-query-sql.repository';

export class GetBlogSubscribersCountQuery extends Query<{
  subscribersCount: number;
}> {
  constructor(public blogId: string) {
    super();
  }
}

@QueryHandler(GetBlogSubscribersCountQuery)
export class GetBlogSubscribersCountHandler implements IQueryHandler<
  GetBlogSubscribersCountQuery,
  { subscribersCount: number }
> {
  constructor(private blogsQueryRepo: BlogsQuerySqlRepository) {}

  async execute({
    blogId,
  }: GetBlogSubscribersCountQuery): Promise<{ subscribersCount: number }> {
    if (!(await this.blogsQueryRepo.existsById(blogId))) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${blogId} was not found`,
      });
    }

    const count = await this.blogsQueryRepo.countSubscribers(blogId);

    return {
      subscribersCount: count,
    };
  }
}
