import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogLean, BlogModelType } from 'src/blogs/domain/blog.entity';
import { CreatePostDto } from '../../api/dto/create-post.dto';
import { Post, PostDocument, PostModel } from '../../domain/post.entity';
import { PostsRepository } from '../../infrastructure/repositories/posts.repository';
import { UpdatePostDto } from 'src/posts/api/dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: BlogModelType,
    @InjectModel(Post.name) private postModel: PostModel,

    private postsRepo: PostsRepository,
  ) {}

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
    const existingPost = await this.postsRepo.findById(id);

    if (!existingPost) {
      throw new NotFoundException(`The post with ID:${id} was not found`);
    }

    if (existingPost.blogId.toString() !== dto.blogId)
      throw new NotFoundException('Post does not exist in this blog!');

    // * обновляем поля в памяти доменной сущности
    existingPost.updatePost(dto);

    // * сохраняем уже обновленный документ
    await this.postsRepo.save(existingPost);
  }
}
