import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs.query-repository';
import { BlogViewModel } from '../../api/dto/view-dto/blog.view-dto';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

export class GetBlogByIdQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler implements IQueryHandler<
  GetBlogByIdQuery,
  BlogViewModel
> {
  constructor(private readonly blogsQueryRepo: BlogsQueryRepository) {}

  async execute({ id }: GetBlogByIdQuery): Promise<BlogViewModel> {
    const blogDoc = await this.blogsQueryRepo.findBlogById(id);

    if (!blogDoc)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${id} was not found`,
      });

    return blogDoc;
  }
}
