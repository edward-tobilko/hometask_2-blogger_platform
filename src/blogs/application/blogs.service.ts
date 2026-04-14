import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { CreateBlogDto } from '../api/dto/create-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    private blogsRepo: BlogsRepository,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<Blog> {
    const blogInstance = this.BlogModel.createBlogInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogsRepo.save(blogInstance);

    return blogInstance;
  }
}
