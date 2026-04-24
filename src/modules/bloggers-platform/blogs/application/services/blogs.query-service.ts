import { Injectable, NotFoundException } from '@nestjs/common';

import { BlogsQueryDto } from 'src/modules/bloggers-platform/blogs/api/dto/blogs-query.dto';
import { BlogViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view/blog.view';
import { BlogListPaginatedViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view/blogs-paginated.view';
import { BlogsQueryRepository } from 'src/modules/bloggers-platform/blogs/infrastructure/repositories/blogs.query-repository';
import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/posts-query.dto';
import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view/posts-paginated.view';

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
      throw new NotFoundException(`The blog with ID:${blogId} was not found`);

    return this.blogsQueryRepo.findPostsForBlog(blogId, queryParams);
  }
}
