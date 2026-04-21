import { Injectable } from '@nestjs/common';

import { BlogsQueryDto } from 'src/blogs/api/dto/blogs-query.dto';
import { BlogViewModel } from 'src/blogs/api/dto/view-models/blog.view-model';
import { BlogListPaginatedViewModel } from 'src/blogs/api/dto/view-models/blogs-paginated.view-model';
import { BlogsQueryRepository } from 'src/blogs/infrastructure/repositories/blogs.query-repository';
import { PostsPaginatedViewModel } from 'src/posts/api/dto/view/posts-paginated.view';

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
