import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import { BlogSubscriptionsRepository } from '../../infrastructure/sql/repositories/blog-subscriptions.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { BlogsSqlRepository } from '../../infrastructure/sql/repositories/blogs-sql.repository';

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
    private blogsRepo: BlogsSqlRepository,
  ) {}

  async execute({
    blogId,
  }: GetBlogSubscribersCountQuery): Promise<{ subscribersCount: number }> {
    const blogInstance = await this.blogsRepo.findById(blogId);

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
