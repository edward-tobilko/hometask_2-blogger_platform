import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import { BlogSubscriptionsRepository } from '../../infrastructure/mongo/repositories/blog-subscriptions.repository';
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
  constructor(
    private blogSubsRepo: BlogSubscriptionsRepository,
    private blogsQueryRepo: BlogsQuerySqlRepository,
  ) {}

  async execute({
    blogId,
  }: GetBlogSubscribersCountQuery): Promise<{ subscribersCount: number }> {
    const blogInstance = await this.blogsQueryRepo.findById(blogId);

    if (!blogInstance) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${blogId} was not found`,
      });
    }

    const countInstance = await this.blogSubsRepo.countSubscribers(blogId);

    return {
      subscribersCount: countInstance,
    };
  }
}
