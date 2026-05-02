import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { PostDocument } from 'src/modules/bloggers-platform/posts/domain/entities/post.entity';
import { PostsService } from 'src/modules/bloggers-platform/posts/application/services/posts.service';
import { CreatePostDomainDto } from 'src/modules/bloggers-platform/posts/domain/dto/create-post.domain-dto';
import { BlogsRepository } from 'src/modules/bloggers-platform/blogs/infrastructure/repositories/blogs.repository';
import {
  Blog,
  BlogDocument,
  BlogModelType,
} from 'src/modules/bloggers-platform/blogs/domain/entities/blog.entity';
import { CreatePostForBlogDto } from 'src/modules/bloggers-platform/blogs/api/dto/input-dto/create-post-for-blog.input-dto';
import { CreateBlogDomainDto } from '../../domain/dto/create-blog.domain-dto';
import { UpdateBlogDomainDto } from '../../domain/dto/update-blog.domain-dto';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: BlogModelType,

    private blogsRepo: BlogsRepository,
    private postsService: PostsService,
  ) {}

  async createBlog(dto: CreateBlogDomainDto): Promise<BlogDocument> {
    const createdBlog = this.blogModel.createBlogInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogsRepo.save(createdBlog);

    return createdBlog;
  }

  async createPostForBlog(
    blogId: string,
    dto: CreatePostForBlogDto,
  ): Promise<PostDocument> {
    // * find blog
    const blogInstance = await this.blogsRepo.findById(blogId);

    if (!blogInstance)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${blogId} was not found`,
      });

    // * create domain post
    const domainPost: CreatePostDomainDto & { blogName: string } = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId,
      blogName: blogInstance.name,
    };

    // * get post from post service
    const post = await this.postsService.createPost(domainPost);

    return post;
  }

  async updateBlog(
    blogId: string,
    updateBlogDto: UpdateBlogDomainDto,
  ): Promise<void> {
    // * достаем инстанс блога по id с его методами
    const blogInstance = await this.blogsRepo.findById(blogId);

    if (!blogInstance)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${blogId} was not found`,
      });

    // * обновляем поля в памяти доменной сущности
    blogInstance.update(updateBlogDto);

    // * сохраняем уже обновленный документ
    await this.blogsRepo.save(blogInstance);
  }

  async deleteBlog(id: string): Promise<void> {
    const blogInstance = await this.blogsRepo.findById(id);

    if (!blogInstance)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${id} was not found`,
      });

    await this.blogsRepo.delete(id);
  }
}
