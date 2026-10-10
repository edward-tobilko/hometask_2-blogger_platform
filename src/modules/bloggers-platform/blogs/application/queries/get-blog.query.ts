import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { BlogViewModel } from '../../api/dto/view-dto/blog.view-dto';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { BlogsQuerySqlRepository } from '../../infrastructure/sql/repositories/blogs-query-sql.repository';

export class GetBlogByIdQuery {
  constructor(
    public id: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler implements IQueryHandler<
  GetBlogByIdQuery,
  BlogViewModel
> {
  constructor(private readonly blogsQueryRepo: BlogsQuerySqlRepository) {}

  async execute({ id, userId }: GetBlogByIdQuery): Promise<BlogViewModel> {
    const blog = await this.blogsQueryRepo.findById(id, userId);

    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${id} was not found`,
      });

    return blog;
  }
}
