import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogModelType } from 'src/blogs/domain/blog.entity';
import { CreatePostDto } from '../api/dto/create-post.dto';
import { Post, PostDocument, PostModel } from '../domain/post.entity';
import { PostsRepository } from '../infrastructure/posts.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: BlogModelType,
    @InjectModel(Post.name) private postModel: PostModel,

    private postsRepo: PostsRepository,
  ) {}

  async createPost(blogId: string, dto: CreatePostDto): Promise<PostDocument> {
    const existingBlog = await this.blogModel.findById(blogId);

    if (!existingBlog) {
      throw new NotFoundException(`The blog with ID:${blogId} was not found`);
    }

    const postInstance = this.postModel.createPostInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
    });

    await this.postsRepo.save(postInstance);

    return postInstance;
  }
}
