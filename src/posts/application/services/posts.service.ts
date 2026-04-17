import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogModelType } from 'src/blogs/domain/blog.entity';
import { CreatePostDto } from '../../api/dto/create-post.dto';
import { Post, PostDocument, PostModel } from '../../domain/post.entity';
import { PostsRepository } from '../../infrastructure/repositories/posts.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: BlogModelType,
    @InjectModel(Post.name) private postModel: PostModel,

    private postsRepo: PostsRepository,
  ) {}

  async createPost(dto: CreatePostDto): Promise<PostDocument> {
    const existingBlog = await this.blogModel.findById(dto.blogId);

    if (!existingBlog) {
      throw new NotFoundException(
        `The blog with ID:${dto.blogId} was not found`,
      );
    }

    const postInstance = this.postModel.createPostInstance({
      ...dto,

      blogName: existingBlog.name, // + опциональное поле с блога
    });

    await this.postsRepo.save(postInstance);

    return postInstance;
  }
}
