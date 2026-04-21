import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { PostDocument } from 'src/posts/domain/entities/post.entity';
import { PostsService } from 'src/posts/application/services/posts.service';
import { CreatePostDomainDto } from 'src/posts/domain/dto/create-post.domain-dto';
import { BlogsRepository } from 'src/blogs/infrastructure/repositories/blogs.repository';
import {
  Blog,
  BlogDocument,
  BlogModelType,
} from 'src/blogs/domain/entities/blog.entity';
import { CreateBlogDto } from 'src/blogs/api/dto/create-blog.dto';
import { CreatePostForBlogDto } from 'src/blogs/api/dto/create-post-for-blog.dto';
import { UpdateBlogDto } from 'src/blogs/api/dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: BlogModelType,

    private blogsRepo: BlogsRepository,
    private postsService: PostsService,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<BlogDocument> {
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
      throw new NotFoundException(`The blog with ID:${blogId} was not found`);

    // * create domain post
    const domainPost: CreatePostDomainDto = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId,
      blogName: blogInstance.name,
    };

    // * get post from post service
    const post = this.postsService.createPost(domainPost);

    return post;
  }

  async updateBlog(
    blogId: string,
    updateBlogDto: UpdateBlogDto,
  ): Promise<void> {
    // * достаем инстанс блога по id с его методами
    const blogInstance = await this.blogsRepo.findById(blogId);

    if (!blogInstance)
      throw new NotFoundException(`The blog with ID:${blogId} was not found`);

    // * обновляем поля в памяти доменной сущности
    blogInstance.update(updateBlogDto);

    // * сохраняем уже обновленный документ
    await this.blogsRepo.save(blogInstance);
  }

  async deleteBlog(id: string): Promise<void> {
    const blogInstance = await this.blogsRepo.findById(id);

    if (!blogInstance)
      throw new NotFoundException(`The blog with ID:${id} was not found`);

    await this.blogsRepo.delete(id);
  }
}
