import { Injectable } from '@nestjs/common';

import { BlogsQueryDto } from '../api/dto/blogs-query.dto';
import { BlogListPaginatedViewModel } from '../view-models/blogs-paginated.view-model';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';

@Injectable()
export class BlogsQueryService {
  constructor(protected blogsQueryRepo: BlogsQueryRepository) {}

  getBlogsList(queryParam: BlogsQueryDto): Promise<BlogListPaginatedViewModel> {
    return this.blogsQueryRepo.findBlogs(queryParam);
  }
}
