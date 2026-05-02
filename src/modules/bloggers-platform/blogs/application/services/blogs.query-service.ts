import { Injectable } from '@nestjs/common';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { BlogsQueryDto } from 'src/modules/bloggers-platform/blogs/api/dto/input-dto/blogs-query.input-dto';
import { BlogViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view-dto/blog.view-dto';
import { BlogListPaginatedViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view-dto/blogs-paginated.view-dto';
import { BlogsQueryRepository } from 'src/modules/bloggers-platform/blogs/infrastructure/repositories/blogs.query-repository';
import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';

@Injectable()
export class BlogsQueryService {
  constructor(protected blogsQueryRepo: BlogsQueryRepository) {}

  getBlogsList(queryParam: BlogsQueryDto): Promise<BlogListPaginatedViewModel> {
    return this.blogsQueryRepo.findBlogs(queryParam);
  }

  getBlogById(blogId: string): Promise<BlogViewModel | null> {
    return this.blogsQueryRepo.findBlogById(blogId);
  }

  async getPostsForBlog(
    blogId: string,
    queryParams: PostsQueryDto,
  ): Promise<PostsPaginatedViewModel> {
    const blogInstance = await this.blogsQueryRepo.findBlogById(blogId);

    if (!blogInstance)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${blogId} was not found`,
      });

    return this.blogsQueryRepo.findPostsForBlog(blogId, queryParams);
  }
}
