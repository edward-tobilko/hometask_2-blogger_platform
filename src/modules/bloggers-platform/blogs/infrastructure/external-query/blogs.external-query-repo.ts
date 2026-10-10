import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { BlogOrmEntity } from '../sql/schemas/blog-orm.entity';

@Injectable()
export class BlogsExternalQueryRepository {
  constructor(
    @InjectRepository(BlogOrmEntity)
    private readonly blogsRepo: Repository<BlogOrmEntity>,
  ) {}

  async findById(blogId: string): Promise<BlogOrmEntity | null> {
    return this.blogsRepo.findOne({ where: { id: blogId } });
  }
}
