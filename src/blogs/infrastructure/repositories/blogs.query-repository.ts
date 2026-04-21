import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { PostsPaginatedViewModel } from 'src/posts/api/dto/view/posts-paginated.view';
import { PostViewModel } from 'src/posts/api/dto/view/post.view';
import { Post, PostLean, PostModel } from 'src/posts/domain/post.entity';
import { Blog, BlogLean, BlogModelType } from 'src/blogs/domain/blog.entity';
import { BlogListPaginatedViewModel } from 'src/blogs/api/dto/view-models/blogs-paginated.view-model';
import { BlogsQueryDto } from 'src/blogs/api/dto/blogs-query.dto';
import { BlogViewModel } from 'src/blogs/api/dto/view-models/blog.view-model';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
    @InjectModel(Post.name) private readonly postModel: PostModel,
  ) {}

  async findBlogs(
    queryParam: BlogsQueryDto,
  ): Promise<BlogListPaginatedViewModel> {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
      queryParam;

    const nameTerm = searchNameTerm ? searchNameTerm.trim() : null;

    const filter = nameTerm
      ? {
          name: { $regex: nameTerm, $options: 'i' },
        }
      : {};

    const [items, totalCount] = await Promise.all([
      this.blogModel
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean<BlogLean[]>()
        .exec(), // превращает Mongoose Query в Promise.

      this.blogModel.countDocuments(filter),
    ]);

    return new BlogListPaginatedViewModel(
      Math.ceil(totalCount / pageSize),
      pageNumber,
      pageSize,
      totalCount,

      items.map(BlogViewModel.mapToViewModel),
    );
  }

  async findBlogById(blogId: string): Promise<BlogViewModel | null> {
    const blogLean = await this.blogModel
      .findById(blogId)
      .lean<BlogLean>()
      .exec();

    if (!blogLean) return null;

    return BlogViewModel.mapToViewModel(blogLean);
  }

  async findPostsForBlog(
    blogId: string,
    query: BlogsQueryDto,
  ): Promise<PostsPaginatedViewModel> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    // * фильтруем (получаем) все посты этого блога
    const filter = { blogId: blogId };

    const [items, totalCount] = await Promise.all([
      this.postModel
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean<PostLean[]>()
        .exec(), // превращает Mongoose Query в Promise.

      this.postModel.countDocuments(filter),
    ]);

    return new PostsPaginatedViewModel(
      Math.ceil(totalCount / pageSize),
      pageNumber,
      pageSize,
      totalCount,

      items.map(PostViewModel.mapToViewModel),
    );
  }
}

// ? @InjectModel(Blog.name) — специальный декоратор от `@nestjs/mongoose`, который говорит Nest: "вколи сюда модель, зарегистрированную под именем `Blog.name`. Без этого декоратора Nest не знает, какую именно модель ты хочешь.
