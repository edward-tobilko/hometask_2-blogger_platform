import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { CreateBlogDto } from '../api/dto/create-blog.dto';
import { UpdateBlogDto } from '../api/dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: BlogModelType,
    private blogsRepo: BlogsRepository,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<BlogDocument> {
    const blogInstance = this.blogModel.createBlogInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogsRepo.save(blogInstance);

    return blogInstance;
  }

  async updateBlog(
    blogId: string,
    updateBlogDto: UpdateBlogDto,
  ): Promise<void> {
    // * достаем инстанс блога по id с его методами
    const existingBlog = await this.blogsRepo.findById(blogId);

    if (!existingBlog)
      throw new NotFoundException(`The blog with ID:${blogId} was not found`);

    // * обновляем поля в памяти доменной сущности
    existingBlog.update(updateBlogDto);

    // * сохраняем уже обновленный документ
    await this.blogsRepo.save(existingBlog);
  }

  async deleteBlog(id: string): Promise<void> {
    const existingBlog = await this.blogsRepo.findById(id);

    if (!existingBlog)
      throw new NotFoundException(`The blog with ID:${id} was not found`);

    await this.blogsRepo.delete(id);
  }
}
