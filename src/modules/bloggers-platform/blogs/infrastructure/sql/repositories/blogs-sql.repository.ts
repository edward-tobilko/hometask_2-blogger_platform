import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateBlogDomainDto } from '../../../domain/dto/create-blog.domain-dto';
import { BlogOrmEntity } from '../schemas/blog-orm.entity';

@Injectable()
export class BlogsSqlRepository {
  constructor(
    @InjectRepository(BlogOrmEntity)
    private readonly blogsRepo: Repository<BlogOrmEntity>,
  ) {}

  async createByAdmin(dto: CreateBlogDomainDto): Promise<BlogOrmEntity> {
    const blogInstance = this.blogsRepo.create({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    return this.blogsRepo.save(blogInstance);
  }

  async save(blog: BlogOrmEntity): Promise<void> {
    await this.blogsRepo.save(blog);
  }

  async findById(blogId: string): Promise<BlogOrmEntity | null> {
    return this.blogsRepo.findOne({
      where: {
        id: blogId,
      },
    });
  }

  // * -- DELETE FROM ... (hard delete)
  async delete(id: string): Promise<void> {
    await this.blogsRepo.delete(id);
  }
}
