import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs.query-repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { BlogPostsCountViewModel } from '../../api/dto/view-dto/blog-posts-count.view-dto';

export class GetPostsCountForBlogQuery {
  constructor(public blogId: string) {}
}

@QueryHandler(GetPostsCountForBlogQuery)
export class GetPostsCountForBlogHandler implements IQueryHandler<
  GetPostsCountForBlogQuery,
  BlogPostsCountViewModel
> {
  constructor(private blogsQueryRepo: BlogsQueryRepository) {}

  async execute({
    blogId,
  }: GetPostsCountForBlogQuery): Promise<BlogPostsCountViewModel> {
    const blogInstance = await this.blogsQueryRepo.findBlogById(blogId);

    if (!blogInstance) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${blogId} was not found`,
      });
    }

    const count = await this.blogsQueryRepo.countPostsForBlog(blogId);

    return BlogPostsCountViewModel.mapToViewModel(count);
  }
}
