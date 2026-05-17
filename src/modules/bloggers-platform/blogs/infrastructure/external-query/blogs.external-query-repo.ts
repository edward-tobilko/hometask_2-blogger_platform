import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  Blog,
  BlogLean,
  BlogModelType,
} from '../../domain/entities/blog.entity';

@Injectable()
export class BlogsExternalQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) {}

  async findById(blogId: string): Promise<BlogLean | null> {
    return this.blogModel
      .findById(blogId)
      .select('name') // что бы не гнать поиск в базе по всему обьекту, выбираем только по значению "name" (faster)
      .lean<BlogLean>()
      .exec();
  }
}
