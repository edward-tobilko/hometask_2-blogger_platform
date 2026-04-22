import { Injectable } from '@nestjs/common';

import { BlogsQueryDto } from 'src/modules/bloggers-platform/blogs/api/dto/blogs-query.dto';
import { BlogViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view/blog.view';
import { BlogListPaginatedViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view/blogs-paginated.view';
import { BlogsQueryRepository } from 'src/modules/bloggers-platform/blogs/infrastructure/repositories/blogs.query-repository';
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

  getPostsForBlog(
    blogId: string,
    queryParams: BlogsQueryDto,
  ): Promise<PostsPaginatedViewModel> {
    return this.blogsQueryRepo.findPostsForBlog(blogId, queryParams);
  }
}
