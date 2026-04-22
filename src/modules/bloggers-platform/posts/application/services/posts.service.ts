import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  Blog,
  BlogLean,
  BlogModelType,
} from 'src/modules/bloggers-platform/blogs/domain/entities/blog.entity';
import { CreatePostDto } from '../../api/dto/create-post.dto';
import {
  Post,
  PostDocument,
  PostModel,
} from '../../domain/entities/post.entity';
import { PostsRepository } from '../../infrastructure/repositories/posts.repository';
import { UpdatePostDto } from 'src/modules/bloggers-platform/posts/api/dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: BlogModelType,
    @InjectModel(Post.name) private postModel: PostModel,

    private postsRepo: PostsRepository,
  ) {}

  // * private helper methods (Extract Method)
  private async findPostOrFail(id: string): Promise<PostDocument> {
    const post = await this.postsRepo.findById(id);

    if (!post) {
      throw new NotFoundException(`The post with ID:${id} was not found`);
    }

    return post;
  }

  // * contracts main methods
  async createPost(dto: CreatePostDto): Promise<PostDocument> {
    const existingBlog = await this.blogModel
      .findById(dto.blogId)
      .select('name') // что бы не гнать поиск бд по всему обьекту, выбираем только по значению "name" (faster)
      .lean<BlogLean>()
      .exec();

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

  async updatePost(id: string, dto: UpdatePostDto): Promise<void> {
    // * достаем инстанс поста по id с его методами
    const existingPost = await this.findPostOrFail(id);

    if (existingPost.blogId.toString() !== dto.blogId)
      throw new NotFoundException('Post does not exist in this blog!');

    // * обновляем поля в памяти доменной сущности
    existingPost.updatePost(dto);

    // * сохраняем уже обновленный документ
    await this.postsRepo.save(existingPost);
  }

  async deletePost(id: string): Promise<void> {
    await this.findPostOrFail(id);

    return await this.postsRepo.delete(id);
  }
}
