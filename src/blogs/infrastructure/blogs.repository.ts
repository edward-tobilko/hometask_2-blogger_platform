import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) {}

  async findById(blogId: string): Promise<BlogDocument | null> {
    return await this.blogModel.findById(blogId).exec();
  }

  async save(blog: BlogDocument) {
    await blog.save();
  }

  async delete(id: string): Promise<void> {
    await this.blogModel.findByIdAndDelete(id);
  }
}
