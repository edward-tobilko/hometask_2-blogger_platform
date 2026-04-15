import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { BlogListPaginatedViewModel } from '../api/dto/view-models/blogs-paginated.view-model';
import { Blog, BlogLean, BlogModelType } from '../domain/blog.entity';
import { BlogsQueryDto } from '../api/dto/blogs-query.dto';
import { BlogViewModel } from '../api/dto/view-models/blog.view-model';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
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
}

// ? @InjectModel(Blog.name) — специальный декоратор от `@nestjs/mongoose`, который говорит Nest: "вколи сюда модель, зарегистрированную под именем `Blog.name`. Без этого декоратора Nest не знает, какую именно модель ты хочешь.
