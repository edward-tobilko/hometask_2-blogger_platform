import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  BlogModelType,
  BlogDocument,
  Blog,
} from 'src/modules/bloggers-platform/blogs/domain/entities/blog.entity';
import { CreateBlogDomainDto } from '../../domain/dto/create-blog.domain-dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) {}

  async findById(blogId: string): Promise<BlogDocument | null> {
    return await this.blogModel.findById(blogId).exec();
  }

  async create(dto: CreateBlogDomainDto): Promise<BlogDocument> {
    const blogInstance = this.blogModel.createBlogInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    }); // ! Технически правильнее передать dto вместо перезаписи полей. То есть, если в CreateBlockDomainDTO добавится четвертое поле, то здесь нам придется тоже его добавлять. Лучше передать просто dto в метод .createBlogInstance(dto).

    await blogInstance.save();

    return blogInstance;
  }

  async save(blog: BlogDocument): Promise<void> {
    await blog.save();
  }

  async delete(id: string): Promise<void> {
    await this.blogModel.findByIdAndDelete(id);
  }
}
