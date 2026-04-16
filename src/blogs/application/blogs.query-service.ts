import { Injectable } from '@nestjs/common';

import { BlogsQueryDto } from '../api/dto/blogs-query.dto';
import { BlogListPaginatedViewModel } from '../api/dto/view-models/blogs-paginated.view-model';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { BlogViewModel } from '../api/dto/view-models/blog.view-model';

@Injectable()
export class BlogsQueryService {
  constructor(protected blogsQueryRepo: BlogsQueryRepository) {}

  getBlogsList(queryParam: BlogsQueryDto): Promise<BlogListPaginatedViewModel> {
    return this.blogsQueryRepo.findBlogs(queryParam);
  }

  getBlogById(blogId: string): Promise<BlogViewModel | null> {
    return this.blogsQueryRepo.findBlogById(blogId);
  }
}
