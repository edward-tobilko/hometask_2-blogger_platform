import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Blog } from './schemas/blogs.schema';
import { BlogsQueryDto } from './dto/blogs-query.dto';
import { BlogListPaginatedViewModel } from './view-models/blogs-paginated.view-model';
import { BlogsQueryRepository } from './blogs.query-repository';

@Injectable()
export class BlogsQueryService {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    protected blogsQueryRepo: BlogsQueryRepository,
  ) {}

  getBlogsList(queryParam: BlogsQueryDto): Promise<BlogListPaginatedViewModel> {
    return this.blogsQueryRepo.findBlogs(queryParam);
  }
}
