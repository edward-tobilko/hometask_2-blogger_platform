import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs.query-repository';

export class GetPostsForBlogQuery {
  constructor(
    public blogId: string,
    public query: PostsQueryDto,
    public userId?: string,
  ) {}
}

@QueryHandler(GetPostsForBlogQuery)
export class GetPostsForBlogQueryHandler implements IQueryHandler<
  GetPostsForBlogQuery,
  PostsPaginatedViewModel
> {
  constructor(protected blogsQueryRepo: BlogsQueryRepository) {}

  async execute({
    blogId,
    query,
    userId,
  }: GetPostsForBlogQuery): Promise<PostsPaginatedViewModel> {
    const blogInstance = await this.blogsQueryRepo.findBlogById(blogId);

    if (!blogInstance)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${blogId} was not found`,
      });

    return this.blogsQueryRepo.findPostsForBlog(blogId, query, userId);
  }
}
